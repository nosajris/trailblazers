import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * One fixed-window counter per visitor and form.
 *
 * Why a table. `packages/core/src/util/rate-limiter.ts` keeps its windows in
 * process memory, and said so: on serverless each instance counts separately
 * and a cold start resets the window, which blunts form spam without actually
 * bounding it. Its own note named Postgres as the follow-up and said it was
 * waiting on `db-seed.yml` — which would wipe production on an ordinary schema
 * commit — being pinned to a disposable database. That is now done (see the
 * Database section of CLAUDE.md), so the counter can live here.
 *
 * `key_hash` is an HMAC of the form name and the submitter's address, so this
 * table never holds an IP address: the same visitor is recognised across
 * requests without their address being stored anywhere, which is the same
 * reasoning as the newsletter's unsubscribe tokens and the session table.
 *
 * Rows are disposable — the daily cron drops any whose window has long closed,
 * and losing the table entirely would only reset everyone's counter.
 */
export const formSubmissionCounters = pgTable(
	'form_submission_counters',
	{
		keyHash: text('key_hash').primaryKey(),
		windowStartedAt: timestamp('window_started_at', { withTimezone: true }).notNull().defaultNow(),
		count: integer('count').notNull().default(1)
	},
	(table) => [
		// Covers the daily prune's `WHERE window_started_at < cutoff`.
		index('form_submission_counters_window_idx').on(table.windowStartedAt)
	]
);
