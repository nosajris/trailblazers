import { desc, eq, isNull } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { inquiries, newsletterSubscribers } from './schema.js';
import { Sanitizer } from '../../util/sanitizer.js';
import { createSessionToken, hashSessionToken } from '../iam/session-tokens.js';
import { logger } from '../../logger.js';

export type NewsletterConfig = {
	/** Keys the HMAC protecting unsubscribe tokens at rest. */
	secretKey: string | undefined;
};

/**
 * The wording a subscriber agrees to. Stored verbatim on each record: consent
 * evidence has to say what the person actually saw, and this copy will change.
 */
export const NEWSLETTER_CONSENT_TEXT =
	'I agree to receive email updates about Trailblazers events and opportunities, ' +
	'and understand I can unsubscribe at any time using the link in every email.';

export type CreateInquiryInput = {
	name: string;
	email: string;
	message: string;
	type?: string;
	phone?: string;
};

export function createInquiryService(db: Database, config: NewsletterConfig) {
	function secret(): string {
		return config.secretKey as string;
	}

	return {
		/**
		 * Records a newsletter signup with the consent evidence POPIA and GDPR
		 * expect: what was agreed to, when, and from where.
		 *
		 * Signups were previously filed as ordinary `inquiries` rows with none of
		 * that, and no way to unsubscribe. Returns the raw unsubscribe token for
		 * the link; only its HMAC is stored.
		 */
		async subscribeToNewsletter(input: {
			email: string;
			source: string;
		}): Promise<{ unsubscribeToken: string; alreadySubscribed: boolean }> {
			const cleanEmail = Sanitizer.email(input.email);
			const now = new Date();
			const { token, tokenHash } = createSessionToken(secret());

			const existing = await db
				.select()
				.from(newsletterSubscribers)
				.where(eq(newsletterSubscribers.email, cleanEmail))
				.limit(1);

			if (existing[0]) {
				// Re-subscribing after an unsubscribe is fresh consent, so the
				// timestamp and wording are refreshed. The token is rotated so an
				// old link cannot be replayed.
				await db
					.update(newsletterSubscribers)
					.set({
						consentedAt: now,
						consentSource: input.source,
						consentText: NEWSLETTER_CONSENT_TEXT,
						unsubscribeTokenHash: tokenHash,
						unsubscribedAt: null
					})
					.where(eq(newsletterSubscribers.id, existing[0].id));

				return {
					unsubscribeToken: token,
					alreadySubscribed: existing[0].unsubscribedAt === null
				};
			}

			await db.insert(newsletterSubscribers).values({
				email: cleanEmail,
				consentedAt: now,
				consentSource: input.source,
				consentText: NEWSLETTER_CONSENT_TEXT,
				unsubscribeTokenHash: tokenHash
			});

			logger.info('NEWSLETTER', 'subscription recorded', { source: input.source });

			return { unsubscribeToken: token, alreadySubscribed: false };
		},

		/**
		 * Honours an unsubscribe link. Idempotent, so a second click still reads
		 * as success rather than an error.
		 */
		async unsubscribeByToken(token: string): Promise<{ ok: boolean }> {
			const tokenHash = hashSessionToken(token, secret());

			const rows = await db
				.update(newsletterSubscribers)
				.set({ unsubscribedAt: new Date(), consentedAt: null })
				.where(eq(newsletterSubscribers.unsubscribeTokenHash, tokenHash))
				.returning();

			if (rows.length === 0) return { ok: false };

			logger.info('NEWSLETTER', 'unsubscribe honoured');
			return { ok: true };
		},

		/** Active subscribers, for a future send. */
		async listActiveSubscribers() {
			return db
				.select()
				.from(newsletterSubscribers)
				.where(isNull(newsletterSubscribers.unsubscribedAt))
				.orderBy(desc(newsletterSubscribers.createdAt));
		},

		async createGeneral(input: CreateInquiryInput) {
			const cleanEmail = Sanitizer.email(input.email);
			const cleanName = Sanitizer.text(input.name);
			const cleanMsg = Sanitizer.text(input.message);

			logger.info('INQUIRY', `Creating general inquiry for ${cleanEmail}`);

			const rows = await db.insert(inquiries).values({
				name: cleanName,
				email: cleanEmail,
				message: cleanMsg,
				type: input.type ?? 'GENERAL',
				status: 'PENDING'
			}).returning();
			return rows[0];
		},

		async createInquiry(input: { fullName: string; email: string; message?: string; type?: string; phone?: string }) {
			const cleanEmail = Sanitizer.email(input.email);
			const cleanName = Sanitizer.text(input.fullName);
			const cleanMsg = Sanitizer.text(input.message);

			logger.info('INQUIRY', `Creating inquiry (${input.type || 'GENERAL'}) for ${cleanEmail}`);

			const rows = await db.insert(inquiries).values({
				name: cleanName,
				email: cleanEmail,
				message: cleanMsg,
				type: input.type ?? 'GENERAL',
				status: 'PENDING'
			}).returning();
			return rows[0];
		},

		async listForAdmin() {
			const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
			return rows.map((r) => ({
				id: r.id,
				fullName: r.name,
				email: r.email,
				message: r.message || '',
				type: r.type || 'GENERAL',
				status: r.status || 'PENDING',
				createdAt: r.createdAt || new Date()
			}));
		},

		async updateStatus(id: number, status: string) {
			const rows = await db.update(inquiries).set({ status }).where(eq(inquiries.id, id)).returning();
			return rows[0];
		},

		async deleteInquiry(id: number) {
			await db.delete(inquiries).where(eq(inquiries.id, id));
		}
	};
}

