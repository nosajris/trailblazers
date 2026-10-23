import {
	pgTable,
	serial,
	text,
	integer,
	timestamp,
	jsonb,
	uniqueIndex,
	index
} from 'drizzle-orm/pg-core';

/**
 * One payment attempt against Paynow or Pesepay. `reference` is ours, minted
 * before the provider is ever called, and is the only thing a public page is
 * ever allowed to look a payment up by — `id` is never exposed.
 *
 * `purpose` + `purposeId` is the generic hook: giving has no row to attach to
 * (`purposeId` stays null), while an event registration's fee payment points
 * back at `event_registrations.id`. A payment is never deleted — `status`
 * moves PENDING → PAID/FAILED/CANCELLED and stays there, which is what a
 * reconciliation or a dispute needs to be able to trust.
 */
export const payments = pgTable(
	'payments',
	{
		id: serial('id').primaryKey(),
		reference: text('reference').notNull(),
		purpose: text('purpose').notNull(), // 'GIVING' | 'EVENT_REGISTRATION'
		purposeId: integer('purpose_id'),
		provider: text('provider').notNull(), // 'PAYNOW' | 'PESEPAY'
		providerReference: text('provider_reference'),
		amount: integer('amount').notNull(), // integer cents
		currency: text('currency').notNull().default('USD'),
		payerName: text('payer_name').notNull(),
		payerEmail: text('payer_email').notNull(),
		payerPhone: text('payer_phone'),
		method: text('method'),
		status: text('status').notNull().default('PENDING'),
		rawResult: jsonb('raw_result').$type<Record<string, unknown>>(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('payments_reference_idx').on(table.reference),
		// Serves the "has this registration already been paid" lookup.
		index('payments_purpose_idx').on(table.purpose, table.purposeId),
		index('payments_status_idx').on(table.status),
		// Serves a signed-in member's "my gifts" lookup.
		index('payments_payer_email_idx').on(table.payerEmail)
	]
);
