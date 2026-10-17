import { gte, sql } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { statDays, statSeen } from './schema.js';

export function createAnalyticsRepository(db: Database) {
	return {
		/**
		 * +1 to the running count for (day, metric, key); `label`, when given,
		 * overwrites whatever was stored before — later, more specific labels
		 * (e.g. a link's current button text) win over older ones.
		 */
		async bump(day: string, metric: string, key = '', label = '') {
			await db
				.insert(statDays)
				.values({ day, metric, key, label, n: 1 })
				.onConflictDoUpdate({
					target: [statDays.day, statDays.metric, statDays.key],
					set: {
						n: sql`${statDays.n} + 1`,
						label: label ? label : sql`${statDays.label}`
					}
				});
		},

		/**
		 * Records that `mark` was seen today. Returns true the first time —
		 * the caller uses that to decide whether this is a new visitor rather
		 * than a repeat view from someone already counted today.
		 */
		async markSeen(day: string, mark: string): Promise<boolean> {
			const rows = await db
				.insert(statSeen)
				.values({ day, mark })
				.onConflictDoNothing({ target: [statSeen.day, statSeen.mark] })
				.returning({ id: statSeen.id });
			return rows.length > 0;
		},

		/** Drops marks from before `day` — they have done their job for good. */
		async pruneSeenBefore(day: string) {
			await db.delete(statSeen).where(sql`${statSeen.day} < ${day}`);
		},

		/** Every row for a day at or after `sinceDay`, for the report window. */
		async rowsSince(sinceDay: string) {
			return db
				.select({
					day: statDays.day,
					metric: statDays.metric,
					key: statDays.key,
					label: statDays.label,
					n: statDays.n
				})
				.from(statDays)
				.where(gte(statDays.day, sinceDay));
		}
	};
}
