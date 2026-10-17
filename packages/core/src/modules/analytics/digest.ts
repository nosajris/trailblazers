/**
 * The weekly site-traffic note emailed to the office. Pure and testable:
 * takes two already-built reports (last week and the week before, for the
 * "up/down on the week before" comparison) and returns the email to send, or
 * null on a quiet week where nobody came — nothing is sent then.
 *
 * Adapted from Strata's `summaryFor` (`src/summary.js`), for one office
 * address instead of per-tenant site owners.
 */
import type { AnalyticsReport } from './logic.js';

const n = (x: number): string => x.toLocaleString('en-US');

function change(now: number, before: number): string {
	if (!before) return now ? ' (new)' : '';
	if (now === before) return ' (the same as the week before)';
	const pct = Math.round((Math.abs(now - before) / before) * 100);
	return ` (${now > before ? 'up' : 'down'} ${pct}% on the week before)`;
}

function range(report: AnalyticsReport): string {
	const first = report.series[0]?.day ?? '';
	const last = report.series.at(-1)?.day ?? first;
	return `${first} to ${last}`;
}

export type WeeklyDigestEmail = { subject: string; text: string };

/** The note for the week `lastWeek` covers, or null when nobody came. */
export function weeklyDigestEmail(
	lastWeek: AnalyticsReport,
	previousWeek: AnalyticsReport,
	siteTitle: string,
	reportUrl: string
): WeeklyDigestEmail | null {
	if (!lastWeek.views) return null;

	const lines = [
		`${siteTitle}: your site last week (${range(lastWeek)})`,
		'',
		`Visitors: ${n(lastWeek.visitors)}${change(lastWeek.visitors, previousWeek.visitors)}`,
		`Page views: ${n(lastWeek.views)}${change(lastWeek.views, previousWeek.views)}`,
		`Link clicks: ${n(lastWeek.clicks)}${lastWeek.visitors ? `, by about ${lastWeek.rate}% of visitors` : ''}`
	];

	if (lastWeek.links.length > 0) {
		lines.push(
			'',
			'Most-clicked links:',
			...lastWeek.links.slice(0, 3).map((l) => `  ${l.label || l.href}: ${n(l.n)}`)
		);
	}
	if (lastWeek.sources.length > 0) {
		lines.push(
			'',
			'Where visitors came from:',
			...lastWeek.sources.slice(0, 3).map((s) => `  ${s.name}: ${n(s.n)}`)
		);
	}

	lines.push('', `The full picture, day by day: ${reportUrl}`);

	return {
		subject: `${siteTitle}: ${n(lastWeek.visitors)} ${lastWeek.visitors === 1 ? 'person' : 'people'} visited last week`,
		text: lines.join('\n')
	};
}
