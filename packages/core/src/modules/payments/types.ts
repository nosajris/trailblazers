/**
 * One interface, several providers — the shape Strata's ROADMAP describes for
 * payments ("Providers are strategies behind one interface"), adapted to the
 * two gateways that actually clear Zimbabwean mobile money: Paynow and
 * Pesepay. Both front EcoCash, OneMoney and card; a caller never branches on
 * which one is active.
 *
 * `amount` is always integer cents (USD), the same convention `events.price`
 * already uses — never a float, which cannot represent money exactly.
 */

export type PaymentMethod = 'ECOCASH' | 'ONEMONEY' | 'INNBUCKS' | 'CARD' | 'OTHER';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export type Payer = {
	name: string;
	email: string;
	phone?: string;
};

export type CreatePaymentInput = {
	/** Our own reference. Unique per attempt; this is what ties a callback back to a row. */
	reference: string;
	/** Integer cents. */
	amount: number;
	/** ISO 4217. Only 'USD' is wired up today — see ADR 0010. */
	currency: string;
	description: string;
	payer: Payer;
	method?: PaymentMethod;
	/** Where the payer's browser returns after paying. */
	returnUrl: string;
	/** Where the provider POSTs its server-to-server result. */
	resultUrl: string;
};

/**
 * What creating a payment gets back.
 *
 * `redirect` is a web checkout the payer's browser is sent to (card, or a
 * mobile-money flow the provider hosts itself). `instructions` is an express
 * mobile-money push: the provider has already prompted the payer's phone, and
 * the caller shows the instructions line while polling or waiting for the
 * callback.
 */
export type CreatePaymentResult =
	| { kind: 'redirect'; redirectUrl: string; providerReference: string; pollUrl?: string }
	| { kind: 'instructions'; instructions: string; providerReference: string; pollUrl?: string };

/** What a provider's callback or poll response decoded to. */
export type ProviderResult = {
	/** Our reference, read back out of the provider's payload. */
	reference: string;
	providerReference: string;
	status: PaymentStatus;
	/** The provider's own raw fields, kept for support and disputes. */
	raw: Record<string, unknown>;
};

export interface PaymentProvider {
	readonly name: 'PAYNOW' | 'PESEPAY';
	createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
	/** Actively polls the provider — used when a callback never arrives. */
	checkStatus(providerReference: string): Promise<PaymentStatus>;
	/**
	 * Decodes and verifies a provider's POST (the `resultUrl` callback).
	 * Returns `null` when the payload cannot be verified — a forged or
	 * malformed callback must never be able to mark a payment paid.
	 */
	parseResult(body: Record<string, string>): ProviderResult | null;
}

export class PaymentConfigError extends Error {}
