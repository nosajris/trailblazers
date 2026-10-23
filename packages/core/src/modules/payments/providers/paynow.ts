/**
 * Paynow (Zimbabwe) — web checkout and mobile-money express checkout
 * (EcoCash / OneMoney) over their classic form-POST interface.
 *
 * Every request and response is `application/x-www-form-urlencoded`, and
 * every one of them carries a `hash`: the uppercase SHA512 hex digest of every
 * other field's *value*, concatenated in the order Paynow lists them, with the
 * integration key appended at the end. Paynow checks that hash on what we
 * send; we check it on everything they send back — a callback or poll result
 * that doesn't reproduce the hash with our own key is not from Paynow and
 * must never be able to mark a payment paid.
 *
 * `buildHash`/`verifyHash` are the whole of that and are exercised directly in
 * `paynow.test.ts` without needing network access or real credentials — the
 * test signs its own fixture and checks the round trip, which is the part of
 * this file that is safe to get wrong silently.
 *
 * Field names and endpoints follow Paynow's published integration guide
 * (https://developers.paynow.co.zw). Confirm them against a live sandbox
 * integration ID/key before taking real payments — a gateway's API is not
 * something to take purely on memory.
 */

import { createHash } from 'node:crypto';
import { logger } from '../../../logger.js';
import type {
	CreatePaymentInput,
	CreatePaymentResult,
	PaymentMethod,
	PaymentProvider,
	PaymentStatus,
	ProviderResult
} from '../types.js';
import { PaymentConfigError } from '../types.js';

export type PaynowConfig = {
	/** Paynow "Integration ID". */
	integrationId: string | undefined;
	/** Paynow "Integration Key" (the secret; never logged, never sent as a field). */
	integrationKey: string | undefined;
};

const INITIATE_URL = 'https://www.paynow.co.zw/interface/initiatetransaction';
const INITIATE_MOBILE_URL = 'https://www.paynow.co.zw/interface/remotetransaction';

/** Paynow's own method codes for its mobile-money express flow. */
const PAYNOW_MOBILE_METHOD: Partial<Record<PaymentMethod, string>> = {
	ECOCASH: 'ecocash',
	ONEMONEY: 'onemoney'
};

function buildHash(values: readonly string[], integrationKey: string): string {
	const concatenated = values.join('') + integrationKey;
	return createHash('sha512').update(concatenated, 'utf8').digest('hex').toUpperCase();
}

/** True when `fields.hash` matches what signing every other field (in Paynow's order) with `integrationKey` produces. */
function verifyHash(
	fields: Record<string, string>,
	order: readonly string[],
	integrationKey: string
): boolean {
	const theirs = fields.hash?.toUpperCase();
	if (!theirs) return false;
	const ours = buildHash(
		order.map((key) => fields[key] ?? ''),
		integrationKey
	);
	return theirs === ours;
}

/** Paynow's response body is `key=value&key=value`, not JSON. */
function parseFormBody(body: string): Record<string, string> {
	const out: Record<string, string> = {};
	for (const pair of body.trim().split('&')) {
		if (!pair) continue;
		const [key, value = ''] = pair.split('=');
		out[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, ' '));
	}
	return out;
}

/** Paynow's status strings, mapped onto our four. Anything unrecognised is treated as still pending rather than silently lost. */
function mapStatus(paynowStatus: string | undefined): PaymentStatus {
	const s = (paynowStatus ?? '').toLowerCase();
	if (s === 'paid' || s === 'awaiting delivery' || s === 'delivered') return 'PAID';
	if (s === 'cancelled') return 'CANCELLED';
	if (s === 'disputed' || s === 'refunded') return 'FAILED';
	return 'PENDING';
}

export function createPaynowProvider(config: PaynowConfig): PaymentProvider {
	function requireKeys(): { integrationId: string; integrationKey: string } {
		if (!config.integrationId || !config.integrationKey) {
			throw new PaymentConfigError(
				'Paynow is not configured — set PAYNOW_INTEGRATION_ID and PAYNOW_INTEGRATION_KEY.'
			);
		}
		return { integrationId: config.integrationId, integrationKey: config.integrationKey };
	}

	return {
		name: 'PAYNOW',

		async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
			const { integrationId, integrationKey } = requireKeys();
			const amount = (input.amount / 100).toFixed(2);
			const mobileMethod = input.method ? PAYNOW_MOBILE_METHOD[input.method] : undefined;

			// Field order matters: it is exactly what gets hashed, and Paynow
			// hashes its reply in the same order it was declared to us.
			const fields: Record<string, string> = {
				id: integrationId,
				reference: input.reference,
				amount,
				additionalinfo: input.description,
				returnurl: input.returnUrl,
				resulturl: input.resultUrl,
				authemail: input.payer.email,
				status: 'Message'
			};
			const order = [
				'id',
				'reference',
				'amount',
				'additionalinfo',
				'returnurl',
				'resulturl',
				'authemail',
				'status'
			];

			if (mobileMethod) {
				fields.phone = input.payer.phone ?? '';
				fields.method = mobileMethod;
				order.push('phone', 'method');
			}

			fields.hash = buildHash(
				order.map((key) => fields[key]),
				integrationKey
			);

			const url = mobileMethod ? INITIATE_MOBILE_URL : INITIATE_URL;
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams(fields).toString()
			});

			const parsed = parseFormBody(await response.text());

			if (parsed.status?.toLowerCase() !== 'ok') {
				logger.error('Paynow', 'initiate rejected', {
					reference: input.reference,
					error: parsed.error
				});
				throw new Error(parsed.error || 'Paynow declined that payment.');
			}

			if (mobileMethod && parsed.instructions) {
				return {
					kind: 'instructions',
					instructions: parsed.instructions,
					providerReference: parsed.pollurl ?? '',
					pollUrl: parsed.pollurl
				};
			}

			return {
				kind: 'redirect',
				redirectUrl: parsed.browserurl,
				providerReference: parsed.pollurl ?? '',
				pollUrl: parsed.pollurl
			};
		},

		/** `providerReference` here is the poll URL Paynow handed back from `createPayment`. */
		async checkStatus(providerReference: string): Promise<PaymentStatus> {
			if (!providerReference) return 'PENDING';
			const response = await fetch(providerReference);
			const parsed = parseFormBody(await response.text());
			return mapStatus(parsed.status);
		},

		parseResult(body: Record<string, string>): ProviderResult | null {
			const { integrationKey } = requireKeys();
			const order = ['reference', 'paynowreference', 'amount', 'status', 'pollurl'].filter(
				(key) => key in body
			);
			if (!verifyHash(body, order, integrationKey)) {
				logger.error('Paynow', 'result hash mismatch', { reference: body.reference });
				return null;
			}
			if (!body.reference) return null;

			return {
				reference: body.reference,
				providerReference: body.pollurl ?? body.paynowreference ?? '',
				status: mapStatus(body.status),
				raw: body
			};
		}
	};
}
