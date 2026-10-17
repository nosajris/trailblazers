import { test } from 'node:test';
import assert from 'node:assert/strict';
import { weeklyDigestEmail } from './digest.js';
import { buildReport } from './logic.js';

// `buildReport`'s `now` is the last day of its 7-day window (see logic.ts),
// so these anchors are chosen to land on the same calendar day (Harare,
// UTC+2) as the rows below.
const LAST_WEEK_NOW = new Date('2026-01-10T00:00:00Z').getTime();
const PREVIOUS_WEEK_NOW = LAST_WEEK_NOW - 7 * 86_400_000; // 2026-01-03

test('returns null for a quiet week with no views', () => {
	const lastWeek = buildReport([], 7, LAST_WEEK_NOW);
	const previousWeek = buildReport([], 7, PREVIOUS_WEEK_NOW);
	assert.equal(weeklyDigestEmail(lastWeek, previousWeek, 'Trailblazers', 'https://example.org/analytics'), null);
});

test('builds a subject and body for a week with traffic, noting the change from the week before', () => {
	const lastWeek = buildReport(
		[
			{ day: '2026-01-10', metric: 'view', key: '', label: '', n: 50 },
			{ day: '2026-01-10', metric: 'visitor', key: '', label: '', n: 20 },
			{ day: '2026-01-10', metric: 'click', key: '/give', label: 'Give', n: 5 },
			{ day: '2026-01-10', metric: 'source', key: 'Facebook', label: '', n: 8 }
		],
		7,
		LAST_WEEK_NOW
	);
	const previousWeek = buildReport(
		[{ day: '2026-01-03', metric: 'visitor', key: '', label: '', n: 10 }],
		7,
		PREVIOUS_WEEK_NOW
	);

	const email = weeklyDigestEmail(lastWeek, previousWeek, 'Trailblazers', 'https://example.org/analytics');
	assert.ok(email);
	assert.match(email.subject, /Trailblazers: 20 people visited last week/);
	assert.match(email.text, /Visitors: 20 \(up 100% on the week before\)/);
	assert.match(email.text, /Give: 5/);
	assert.match(email.text, /Facebook: 8/);
	assert.match(email.text, /https:\/\/example\.org\/analytics/);
});

test('a first-ever week with traffic is reported as new, not a percent change', () => {
	const lastWeek = buildReport(
		[
			{ day: '2026-01-10', metric: 'view', key: '', label: '', n: 5 },
			{ day: '2026-01-10', metric: 'visitor', key: '', label: '', n: 3 }
		],
		7,
		LAST_WEEK_NOW
	);
	const previousWeek = buildReport([], 7, PREVIOUS_WEEK_NOW);
	const email = weeklyDigestEmail(lastWeek, previousWeek, 'Trailblazers', 'https://example.org/analytics');
	assert.ok(email);
	assert.match(email.text, /Visitors: 3 \(new\)/);
});

test('singular wording for exactly one visitor', () => {
	const lastWeek = buildReport(
		[
			{ day: '2026-01-10', metric: 'view', key: '', label: '', n: 1 },
			{ day: '2026-01-10', metric: 'visitor', key: '', label: '', n: 1 }
		],
		7,
		LAST_WEEK_NOW
	);
	const previousWeek = buildReport([], 7, PREVIOUS_WEEK_NOW);
	const email = weeklyDigestEmail(lastWeek, previousWeek, 'Trailblazers', 'https://example.org/analytics');
	assert.ok(email);
	assert.match(email.subject, /1 person visited last week/);
});
