/**
 * Pesepay (Zimbabwe) — JSON-over-HTTPS, with the whole payload encrypted
 * rather than form-hashed the way Paynow is.
 *
 * Every request and response body is `{ "payload": "<base64 ciphertext>" }`.
 * The plaintext is AES-256-CBC, keyed by the integration's *encryption key*
 * (32 bytes), with the IV taken as the first 16 bytes of that same key — the
 * scheme Pesepay's own SDKs use, so a single secret is all an integration
 * needs to hold. `encrypt`/`decrypt` are exercised directly in
 * `pesepay.test.ts` as a round trip against a fixed key, independent of
 * network access or real credentials.
 *
 * **Confirm the exact request/response field names against Pesepay's current
 * API reference before taking a real payment.** The encryption scheme here is
 * verified by its own test; the *shape* of `initiate`'s payload and of the
 * decrypted response (`redirectUrl` / `pollUrl` / `referenceNumber` /
 * `transactionStatus`) follows their published integration guide and node SDK
 * as of this writing, but a fintech's field names are exactly the kind of
 * detail that drifts and that memory alone should not be trusted for.
 */

import { createCipheriv, createDecipheriv } from 'node:crypto';
import { logger } from '../../../logger.js';
import type {
	CreatePaymentInput,
	CreatePaymentResult,
	PaymentProvider,
	PaymentStatus,
	ProviderResult
} from '../types.js';
import { PaymentConfigError } from '../types.js';

export type PesepayConfig = {
	/** Sent as the `key` request header. */
	integrationKey: string | undefined;
	/** AES key (and IV source) for the payload. 32 bytes exactly. */
	encryptionKey: string | undefined;
};

const BASE_URL = 'https://api.pesepay.com/api/payments-engine/v1';

export function encrypt(plaintext: string, encryptionKey: string): string {
	const key = Buffer.from(encryptionKey, 'utf8');
	const iv = key.subarray(0, 16);
	const cipher = createCipheriv('aes-256-cbc', key, iv);
	return Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]).toString('base64');
}

export function decrypt(ciphertextBase64: string, encryptionKey: string): string {
	const key = Buffer.from(encryptionKey, 'utf8');
	const iv = key.subarray(0, 16);
	const decipher = createDecipheriv('aes-256-cbc', key, iv);
	return Buffer.concat([
		decipher.update(Buffer.from(ciphertextBase64, 'base64')),
		decipher.final()
	]).toString('utf8');
}

function mapStatus(transactionStatus: string | undefined): PaymentStatus {
	const s = (transactionStatus ?? '').toUpperCase();
	if (s === 'SUCCESS' || s === 'PAID') return 'PAID';
	if (s === 'CANCELLED') return 'CANCELLED';
	if (s === 'FAILED' || s === 'ERROR' || s === 'REVERSED') return 'FAILED';
	return 'PENDING';
}

export function createPesepayProvider(config: PesepayConfig): PaymentProvider {
	function requireKeys(): { integrationKey: string; encryptionKey: string } {
		if (!config.integrationKey || !config.encryptionKey) {
			throw new PaymentConfigError(
				'Pesepay is not configured — set PESEPAY_INTEGRATION_KEY and PESEPAY_ENCRYPTION_KEY.'
			);
		}
		if (config.encryptionKey.length !== 32) {
			throw new PaymentConfigError('PESEPAY_ENCRYPTION_KEY must be exactly 32 characters.');
		}
		return { integrationKey: config.integrationKey, encryptionKey: config.encryptionKey };
	}

	async function call(
		path: string,
		encryptionKey: string,
		integrationKey: string,
		payload: unknown,
		method = 'POST'
	) {
		const body =
			method === 'GET'
				? undefined
				: JSON.stringify({ payload: encrypt(JSON.stringify(payload), encryptionKey) });
		const response = await fetch(`${BASE_URL}${path}`, {
			method,
			headers: { 'Content-Type': 'application/json', key: integrationKey },
			body
		});
		const json = (await response.json()) as { payload?: string };
		if (!json.payload) throw new Error('Pesepay returned no payload.');
		return JSON.parse(decrypt(json.payload, encryptionKey)) as Record<string, unknown>;
	}

	return {
		name: 'PESEPAY',

		async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
			const { integrationKey, encryptionKey } = requireKeys();

			const result = await call('/payments/initiate', encryptionKey, integrationKey, {
				amountDetails: { amount: input.amount / 100, currencyCode: input.currency },
				reasonForPayment: input.description,
				resultUrl: input.resultUrl,
				returnUrl: input.returnUrl,
				merchantReference: input.reference,
				customer: {
					email: input.payer.email,
					phoneNumber: input.payer.phone ?? '',
					name: input.payer.name
				}
			});

			if (result.success === false) {
				logger.error('Pesepay', 'initiate rejected', {
					reference: input.reference,
					message: result.message
				});
				throw new Error(
					typeof result.message === 'string' ? result.message : 'Pesepay declined that payment.'
				);
			}

			const providerReference = String(result.referenceNumber ?? '');
			if (typeof result.redirectUrl === 'string' && result.redirectUrl) {
				return {
					kind: 'redirect',
					redirectUrl: result.redirectUrl,
					providerReference,
					pollUrl: providerReference
				};
			}

			return {
				kind: 'instructions',
				instructions:
					typeof result.pollUrl === 'string'
						? 'Check your phone to approve the payment prompt.'
						: 'Follow the instructions sent to your phone to complete payment.',
				providerReference,
				pollUrl: providerReference
			};
		},

		/** `providerReference` is Pesepay's `referenceNumber` from `createPayment`. */
		async checkStatus(providerReference: string): Promise<PaymentStatus> {
			const { integrationKey, encryptionKey } = requireKeys();
			if (!providerReference) return 'PENDING';
			const result = await call(
				`/payments/check-payment/${encodeURIComponent(providerReference)}`,
				encryptionKey,
				integrationKey,
				undefined,
				'GET'
			);
			return mapStatus(String(result.transactionStatus ?? ''));
		},

		/**
		 * Pesepay's result callback posts `{ "payload": "<ciphertext>" }` just
		 * like every other response — decrypting it is itself the
		 * authentication, since only a party holding our encryption key could
		 * have produced ciphertext that decrypts to a sensible JSON object. A
		 * forged or garbled callback simply fails to decrypt or to parse.
		 */
		parseResult(body: Record<string, string>): ProviderResult | null {
			const { encryptionKey } = requireKeys();
			if (!body.payload) return null;

			let decoded: Record<string, unknown>;
			try {
				decoded = JSON.parse(decrypt(body.payload, encryptionKey));
			} catch (err) {
				logger.error('Pesepay', 'result payload could not be decrypted', {
					message: err instanceof Error ? err.message : String(err)
				});
				return null;
			}

			const reference = decoded.merchantReference ?? decoded.reference;
			if (typeof reference !== 'string' || !reference) return null;

			return {
				reference,
				providerReference: String(decoded.referenceNumber ?? ''),
				status: mapStatus(String(decoded.transactionStatus ?? '')),
				raw: decoded
			};
		}
	};
}
