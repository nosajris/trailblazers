import { lt, sql } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { formSubmissionCounters } from './schema.js';
import type { RateCounter } from './form-token.js';

export function createFormGuardRepository(db: Database) {
	return {
		/**
		 * Counts one submission and returns the window it landed in.
		 *
		 * One statement, on purpose. Reading the row and then writing it back
		 * would let two submissions arriving together both read the same count
		 * and both be allowed; here the increment and the window rollover are
		 * decided inside the upsert, so the returned number is authoritative.
		 * Whether that number is over the limit is `decideFromCounter`'s call,
		 * which keeps the arithmetic testable without a database.
		 *
		 * The `case` expressions are the rollover: a row whose window has closed
		 * starts a fresh one at 1 rather than carrying an old count forward.
		 */
		async countSubmission(keyHash: string, now: Date, windowMs: number): Promise<RateCounter> {
			const cutoff = new Date(now.getTime() - windowMs);

			const rows = await db
				.insert(formSubmissionCounters)
				.values({ keyHash, windowStartedAt: now, count: 1 })
				.onConflictDoUpdate({
					target: formSubmissionCounters.keyHash,
					set: {
						count: sql`case when ${formSubmissionCounters.windowStartedAt} > ${cutoff}::timestamptz then ${formSubmissionCounters.count} + 1 else 1 end`,
						windowStartedAt: sql`case when ${formSubmissionCounters.windowStartedAt} > ${cutoff}::timestamptz then ${formSubmissionCounters.windowStartedAt} else ${now}::timestamptz end`
					}
				})
				.returning();

			const row = rows[0];
			return { count: row?.count ?? 1, windowStartedAt: row?.windowStartedAt ?? now };
		},

		/** Drops counters whose window closed long ago. Called by the daily cron. */
		async prune(before: Date): Promise<void> {
			await db
				.delete(formSubmissionCounters)
				.where(lt(formSubmissionCounters.windowStartedAt, before));
		}
	};
}
