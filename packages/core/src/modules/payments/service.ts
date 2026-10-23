import { randomUUID } from 'node:crypto';
import type { Database } from '../../db/client.js';
import { PolicyError } from '../iam/permissions.js';
import type { PageRequest } from '../../util/pagination.js';
import { paginate } from '../../util/pagination.js';
import { createPaymentsRepository } from './repository.js';
import { createPaynowProvider, type PaynowConfig } from './providers/paynow.js';
import { createPesepayProvider, type PesepayConfig } from './providers/pesepay.js';
import type { CreatePaymentResult, PaymentMethod, PaymentProvider } from './types.js';
import { PaymentConfigError } from './types.js';
import { Sanitizer } from '../../util/sanitizer.js';
import { logger } from '../../logger.js';

export type ProviderName = 'PAYNOW' | 'PESEPAY';

export type PaymentsConfig = {
	paynow: PaynowConfig;
	pesepay: PesepayConfig;
	/** Which provider `startPayment` uses when the caller doesn't ask for one by name. */
	defaultProvider: ProviderName;
};

export type StartPaymentInput = {
	purpose: 'GIVING' | 'EVENT_REGISTRATION';
	purposeId?: number;
	/**
	 * Pre-minted via `mintPaymentReference` when the caller needs to know the
	 * reference before calling `startPayment` — typically to build a
	 * `returnUrl`/`resultUrl` that embeds it (see the giving action). Minted
	 * here otherwise.
	 */
	reference?: string;
	amount: number;
	currency?: string;
	description: string;
	payer: { name: string; email: string; phone?: string };
	method?: PaymentMethod;
	returnUrl: string;
	resultUrl: string;
	provider?: ProviderName;
};

/**
 * `reference` is what the provider sends back and what every public lookup
 * (the return-page, the status poll) is keyed on — never the row's own `id`,
 * which would let someone page through other people's giving by incrementing
 * a number in the URL.
 */
export function mintPaymentReference(purpose: 'GIVING' | 'EVENT_REGISTRATION'): string {
	const prefix = purpose === 'GIVING' ? 'GIVE' : 'EVT';
	return `${prefix}-${randomUUID()}`;
}

/**
 * `providerOverrides` exists for tests: a fake `PaymentProvider` in place of
 * the real Paynow/Pesepay HTTP clients, so `startPayment`/`handleCallback`'s
 * own logic (reference minting, idempotent status moves, config-error
 * surfacing) is directly testable without a network call or real credentials.
 * Production callers never pass it.
 */
export function createPaymentsService(
	db: Database,
	config: PaymentsConfig,
	providerOverrides?: Partial<Record<ProviderName, PaymentProvider>>,
	onManualGivingConfirmed?: (registrationId: number) => Promise<void>
) {
	const repo = createPaymentsRepository(db);

	const providers: Record<ProviderName, PaymentProvider> = {
		PAYNOW: providerOverrides?.PAYNOW ?? createPaynowProvider(config.paynow),
		PESEPAY: providerOverrides?.PESEPAY ?? createPesepayProvider(config.pesepay)
	};

	function providerFor(name: ProviderName | undefined): PaymentProvider {
		return providers[name ?? config.defaultProvider];
	}

	return {
		/** Which provider a caller should build its `resultUrl` callback path for when it doesn't ask for one by name. */
		defaultProviderName(): ProviderName {
			return config.defaultProvider;
		},

		/** Whether at least one provider has real credentials — lets a page hide "Give online" entirely rather than show a broken form. */
		isAnyProviderConfigured(): boolean {
			return Boolean(
				(config.paynow.integrationId && config.paynow.integrationKey) ||
				(config.pesepay.integrationKey && config.pesepay.encryptionKey)
			);
		},

		/**
		 * Creates the payment row, then calls the provider. If the provider call
		 * fails, the row is left PENDING rather than deleted — a failed attempt
		 * is still something support may need to see, and the payer can simply
		 * try again under a fresh reference.
		 */
		async startPayment(
			input: StartPaymentInput
		): Promise<{ reference: string; result: CreatePaymentResult }> {
			const providerName = input.provider ?? config.defaultProvider;
			const provider = providerFor(providerName);
			const reference = input.reference ?? mintPaymentReference(input.purpose);
			const payerEmail = Sanitizer.email(input.payer.email);
			const payerName = Sanitizer.text(input.payer.name);
			const payerPhone = input.payer.phone ? Sanitizer.phone(input.payer.phone) : undefined;

			await repo.insert({
				reference,
				purpose: input.purpose,
				purposeId: input.purposeId,
				provider: providerName,
				amount: input.amount,
				currency: input.currency ?? 'USD',
				payerName,
				payerEmail,
				payerPhone,
				method: input.method
			});

			try {
				const result = await provider.createPayment({
					reference,
					amount: input.amount,
					currency: input.currency ?? 'USD',
					description: input.description,
					payer: { name: payerName, email: payerEmail, phone: payerPhone },
					method: input.method,
					returnUrl: input.returnUrl,
					resultUrl: input.resultUrl
				});

				await repo.updateStatus(reference, 'PENDING', { providerReference: pollKeyFor(result) });

				logger.info('Payments', 'payment started', { reference, provider: providerName });
				return { reference, result };
			} catch (err) {
				logger.error('Payments', 'provider rejected the payment', {
					reference,
					provider: providerName,
					message: err instanceof Error ? err.message : String(err)
				});
				if (err instanceof PaymentConfigError) throw err;
				throw new Error('We could not start that payment just now. Please try again shortly.');
			}
		},

		/**
		 * Handles a provider's server-to-server result POST. Verification lives
		 * inside each provider's `parseResult` — this only trusts a result once
		 * the provider has vouched for it, and only ever moves a payment that is
		 * still PENDING (a payment already PAID or FAILED does not get
		 * re-decided by a retried or duplicate callback).
		 */
		async handleCallback(providerName: ProviderName, body: Record<string, string>) {
			const provider = providerFor(providerName);
			const parsed = provider.parseResult(body);
			if (!parsed) {
				logger.error('Payments', 'callback failed verification', { provider: providerName });
				return { ok: false as const };
			}

			const existing = await repo.findByReference(parsed.reference);
			if (!existing) {
				logger.error('Payments', 'callback for unknown reference', { reference: parsed.reference });
				return { ok: false as const };
			}
			if (existing.status !== 'PENDING') {
				return { ok: true as const, payment: existing, changed: false };
			}

			const updated = await repo.updateStatus(parsed.reference, parsed.status, {
				providerReference: parsed.providerReference,
				rawResult: parsed.raw
			});

			logger.info('Payments', 'payment updated from callback', {
				reference: parsed.reference,
				status: parsed.status
			});

			return { ok: true as const, payment: updated, changed: true };
		},

		/** Active poll fallback for when a callback never arrives (used by the giving return page and a cron sweep). */
		async refreshStatus(reference: string) {
			const existing = await repo.findByReference(reference);
			if (!existing || existing.status !== 'PENDING' || !existing.providerReference)
				return existing;

			const provider = providerFor(existing.provider as ProviderName);
			const status = await provider.checkStatus(existing.providerReference);
			if (status === existing.status) return existing;

			return repo.updateStatus(reference, status);
		},

		async getByReference(reference: string) {
			return repo.findByReference(reference);
		},

		async listForPurpose(purpose: 'GIVING' | 'EVENT_REGISTRATION', purposeId: number) {
			return repo.findByPurpose(purpose, purposeId);
		},

		/** Paged, newest first — the admin /payments listing. */
		async listAllForAdmin(request: PageRequest) {
			const [rows, countRows] = await Promise.all([
				repo.listForAdminPage(request.pageSize, request.offset),
				repo.countAll()
			]);
			return paginate(rows, countRows[0]?.value ?? 0, request);
		},

		/**
		 * Staff override for a payment taken outside the gateways — cash, a
		 * bank transfer, an EcoCash swipe the provider's own callback never
		 * reported. Only ever moves a still-PENDING or FAILED row to PAID;
		 * never re-decides a payment that already cleared or was cancelled,
		 * so an operator cannot "unfail" history by repeating the action.
		 */
		async markAsPaidManually(reference: string, note: string, actorName: string) {
			const existing = await repo.findByReference(reference);
			if (!existing) throw new PolicyError('No such payment.');
			if (existing.status === 'PAID') throw new PolicyError('That payment is already marked paid.');
			if (existing.status === 'CANCELLED') {
				throw new PolicyError('A cancelled payment cannot be marked paid — start a new one instead.');
			}

			const updated = await repo.updateStatus(reference, 'PAID', {
				rawResult: {
					manualOverride: true,
					note,
					markedBy: actorName,
					markedAt: new Date().toISOString()
				}
			});

			if (updated?.purpose === 'EVENT_REGISTRATION' && updated.purposeId) {
				await onManualGivingConfirmed?.(updated.purposeId);
			}

			return updated;
		},

		async getCounts() {
			const [pending, failed, paidTotalCents] = await Promise.all([
				repo.countByStatus('PENDING'),
				repo.countByStatus('FAILED'),
				repo.sumPaidAmount()
			]);
			return { pending, failed, paidTotalCents };
		},

		/** A signed-in member's own giving/registration-fee history. */
		async listForEmail(email: string) {
			return repo.listForEmail(email);
		}
	};
}

function pollKeyFor(result: CreatePaymentResult): string | undefined {
	return (
		result.pollUrl ??
		(result.kind === 'redirect' || result.kind === 'instructions'
			? result.providerReference
			: undefined)
	);
}
