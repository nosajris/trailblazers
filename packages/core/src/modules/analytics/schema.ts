import { index, integer, pgTable, serial, text, uniqueIndex } from 'drizzle-orm/pg-core';

/**
 * One day's counts for one metric and key — no visitor is ever stored for
 * longer than the day they came on, only the running tally. `metric` is
 * `view` | `visitor` | `click` | `source` | `campaign`; `key` is the clicked
 * link's path (click), the traffic source name (source), or the pipe-joined
 * UTM tuple (campaign) — empty for `view`/`visitor`. `label` is a
 * human-readable caption (e.g. the link's button text) kept alongside a
 * click's `key`, overwritten by whichever write saw it last non-empty.
 *
 * Adapted from Strata's `stat_days` table (`strata-main/strata/migrations/
 * site/009_stats.js`), with a surrogate `id` in place of a composite primary
 * key to match this codebase's schema convention.
 */
export const statDays = pgTable(
	'stat_days',
	{
		id: serial('id').primaryKey(),
		day: text('day').notNull(),
		metric: text('metric').notNull(),
		key: text('key').notNull().default(''),
		label: text('label').notNull().default(''),
		n: integer('n').notNull().default(0)
	},
	(table) => [
		uniqueIndex('stat_days_day_metric_key_idx').on(table.day, table.metric, table.key),
		index('stat_days_day_idx').on(table.day)
	]
);

/**
 * A one-way mark of "this visitor has been counted today" — `mark` is an
 * HMAC of the day, IP and user agent together, so it cannot be linked to the
 * same visitor on a different day. Rows older than today are deleted on the
 * next write (see `service.ts`), so nothing here outlives the day it was
 * made on.
 */
export const statSeen = pgTable(
	'stat_seen',
	{
		id: serial('id').primaryKey(),
		day: text('day').notNull(),
		mark: text('mark').notNull()
	},
	(table) => [uniqueIndex('stat_seen_day_mark_idx').on(table.day, table.mark)]
);
