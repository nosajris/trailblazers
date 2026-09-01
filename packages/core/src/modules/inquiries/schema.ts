import { pgTable, serial, text, timestamp, index } from 'drizzle-orm/pg-core';

export const inquiries = pgTable(
	'inquiries',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		email: text('email').notNull(),
		message: text('message'),
		type: text('type').default('GENERAL'),
		status: text('status').default('PENDING'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(table) => [index('inquiries_status_created_at_idx').on(table.status, table.createdAt)]
);

/**
 * Newsletter list, with the consent record POPIA and GDPR expect.
 *
 * Signups used to be filed as ordinary `inquiries` rows: no record of what the
 * person agreed to, when, or from where, and no way to unsubscribe. Those
 * questions have to be answerable years later, so they get their own table.
 */
export const newsletterSubscribers = pgTable(
	'newsletter_subscribers',
	{
		id: serial('id').primaryKey(),
		email: text('email').notNull().unique(),
		/** When consent was given. Null once unsubscribed. */
		consentedAt: timestamp('consented_at', { withTimezone: true }),
		/** Where it was given, e.g. 'footer-form'. */
		consentSource: text('consent_source'),
		/** The exact wording shown at the time, stored verbatim as evidence. */
		consentText: text('consent_text'),
		/** HMAC of the unsubscribe token; the raw token only ever exists in the link. */
		unsubscribeTokenHash: text('unsubscribe_token_hash').notNull().unique(),
		unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [index('newsletter_subscribers_unsubscribed_idx').on(table.unsubscribedAt)]
);
