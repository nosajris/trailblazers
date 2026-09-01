import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { Database } from '../../db/client.js';
import { prayerRequests } from './schema.js';
import { PolicyError } from '../iam/permissions.js';
import { Sanitizer } from '../../util/sanitizer.js';
import { logger } from '../../logger.js';
import { checkbox, email, oneOf, optionalPhone, optionalText, requiredText, id } from '../../util/form.js';
import { canStaffShare, toPublicPrayerList } from './visibility.js';

export const submitPrayerSchema = z.object({
	fullName: optionalText(120),
	email: z.union([z.literal(''), email()]).optional(),
	phone: optionalPhone(),
	request: requiredText('Your prayer request', 2000),
	/** Checked means "you may share this with a prayer team". */
	allowSharing: checkbox(),
	isAnonymous: checkbox()
});

export const updatePrayerSchema = z.object({
	id: id('Prayer request'),
	status: oneOf(['NEW', 'PRAYING', 'FOLLOWED_UP', 'CLOSED'], 'Status'),
	staffNotes: optionalText(2000),
	sharedPublicly: checkbox()
});

export type SubmitPrayerInput = z.infer<typeof submitPrayerSchema>;
export type UpdatePrayerInput = z.infer<typeof updatePrayerSchema>;

export function createPrayerService(db: Database) {
	return {
		/**
		 * Records a request from the public form.
		 *
		 * `isPrivate` is the inverse of the sharing checkbox, so leaving the box
		 * alone — which is what most people do — keeps the request private.
		 * Consent here is opt-in, never assumed.
		 */
		async submit(input: SubmitPrayerInput) {
			const rows = await db
				.insert(prayerRequests)
				.values({
					fullName: input.isAnonymous ? null : (input.fullName ?? null),
					email: input.email ? Sanitizer.email(input.email) : null,
					phone: input.phone ?? null,
					request: input.request,
					isPrivate: !input.allowSharing,
					isAnonymous: input.isAnonymous,
					sharedPublicly: false,
					status: 'NEW'
				})
				.returning();

			// Deliberately low-cardinality: never log the request text, and never
			// log who submitted it.
			logger.info('Prayer', 'request received', { private: !input.allowSharing });

			return rows[0];
		},

		/** The staff follow-up queue, newest first. */
		async listForStaff(status?: string) {
			const query = db
				.select()
				.from(prayerRequests)
				.orderBy(desc(prayerRequests.createdAt))
				.limit(200);

			return status ? query.where(eq(prayerRequests.status, status)) : query;
		},

		/** Only requests with both consent and staff review. */
		async listPublic(limit = 20) {
			const rows = await db
				.select()
				.from(prayerRequests)
				.where(eq(prayerRequests.sharedPublicly, true))
				.orderBy(desc(prayerRequests.createdAt))
				.limit(limit);

			// Filtered again in code rather than trusting the query alone: this is
			// the one place where a wrong row is a real breach of confidence.
			return toPublicPrayerList(rows);
		},

		/** Staff update: status, notes, and the sharing decision. */
		async update(input: UpdatePrayerInput, actorId?: number) {
			const existing = await db.query.prayerRequests.findFirst({
				where: eq(prayerRequests.id, input.id)
			});

			if (!existing) throw new PolicyError('That prayer request no longer exists.');

			if (input.sharedPublicly && !canStaffShare(existing)) {
				throw new PolicyError(
					'This request was submitted privately and cannot be shared. Ask the person first.'
				);
			}

			const rows = await db
				.update(prayerRequests)
				.set({
					status: input.status,
					staffNotes: input.staffNotes ?? null,
					sharedPublicly: input.sharedPublicly,
					assignedToUserId: actorId ?? existing.assignedToUserId,
					updatedAt: new Date()
				})
				.where(eq(prayerRequests.id, input.id))
				.returning();

			return rows[0];
		}
	};
}
