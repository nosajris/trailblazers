import type { Database } from '../../db/client.js';
import { createAnalyticsRepository } from './repository.js';
import { buildReport, dayOf, hasUtm, looksLikeBot, markFor, sourceOf, utmOf, type AnalyticsReport, type Utm } from './logic.js';

export type AnalyticsConfig = {
	/** Keys the HMAC that turns an IP+UA into a one-way daily mark. Shared with the session/token secret — see iam/service.ts for the same lazy-cast pattern. */
	secretKey: string | undefined;
};

export type RecordViewInput = {
	ip: string;
	ua: string | null | undefined;
	src?: string;
	ref?: string;
	utm?: Utm | null;
	now?: number;
};

/**
 * Cookieless page-view analytics: what a site owner sees — how many people
 * came, where from, and which links they pressed — without ever storing a
 * cookie, an IP address, or a user agent. A visitor is counted once a day by
 * a one-way mark made from their address, browser, and the day together (see
 * `markFor`), and that mark is dropped the moment a new day starts.
 *
 * Adapted from Strata's `src/stats.js`.
 */
export function createAnalyticsService(db: Database, config: AnalyticsConfig) {
	const repo = createAnalyticsRepository(db);

	function secret(): string {
		// Read lazily, same as iam/service.ts: this module is imported during
		// the build, where no environment is configured, but nothing calls
		// this path there.
		return config.secretKey as string;
	}

	return {
		dayOf,
		sourceOf,
		looksLikeBot,
		utmOf,

		/**
		 * One page view. Bots are never counted. Returns whether this was the
		 * visitor's first view of the day — a fresh visitor also tallies a
		 * `visitor` and a `source` row, and the previous day's marks are
		 * pruned so nothing lingers longer than it has to.
		 */
		async recordView({ ip, ua, src = '', ref = '', utm = null, now = Date.now() }: RecordViewInput): Promise<boolean> {
			if (looksLikeBot(ua)) return false;

			const day = dayOf(now);
			const mark = markFor(secret(), day, ip, ua ?? '');
			await repo.bump(day, 'view');
			const fresh = await repo.markSeen(day, mark);
			if (fresh) {
				await repo.bump(day, 'visitor');
				await repo.bump(day, 'source', sourceOf({ src, ref, ua: ua ?? '', utm }));
				if (utm && hasUtm(utm)) {
					await repo.bump(day, 'campaign', [utm.source, utm.medium, utm.content, utm.campaign].join('|'));
				}
				await repo.pruneSeenBefore(day);
			}
			return fresh;
		},

		/** One click on a tracked link (e.g. the Give or Watch Live button on the home page). */
		async recordClick(href: string, label = '', now = Date.now()): Promise<void> {
			await repo.bump(dayOf(now), 'click', String(href).slice(0, 300), String(label).slice(0, 140));
		},

		/** The numbers for the last `days` days (today included), for the admin report. */
		async report(days = 7, now = Date.now()): Promise<AnalyticsReport> {
			const since = dayOf(now - (days - 1) * 86_400_000);
			const rows = await repo.rowsSince(since);
			return buildReport(rows, days, now);
		}
	};
}
