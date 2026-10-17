import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildReport, dayOf, looksLikeBot, markFor, sourceOf, utmOf } from './logic.js';

test('dayOf returns Harare-local YYYY-MM-DD', () => {
	// 2026-01-01T23:30:00Z is already 2026-01-02 two hours east of UTC.
	assert.equal(dayOf(new Date('2026-01-01T23:30:00Z').getTime()), '2026-01-02');
	assert.equal(dayOf(new Date('2026-01-01T21:00:00Z').getTime()), '2026-01-01');
});

test('utmOf cleans each field and drops anything not alphanumeric-ish', () => {
	assert.deepEqual(utmOf({ utm_source: 'IG', utm_medium: 'Social!', utm_content: null, utm_campaign: undefined }), {
		source: 'ig',
		medium: 'social',
		content: '',
		campaign: ''
	});
});

test('sourceOf prefers an explicit utm_source, mapped through the alias table', () => {
	assert.equal(sourceOf({ utm: { source: 'ig', medium: '', content: '', campaign: '' } }), 'Instagram');
});

test('sourceOf falls back to a raw utm_source as a tagged source when not a known alias', () => {
	assert.equal(sourceOf({ utm: { source: 'newsletter', medium: '', content: '', campaign: '' } }), 'tag:newsletter');
});

test('sourceOf reads a ?src= tag next, ahead of the referrer', () => {
	assert.equal(sourceOf({ src: 'Poster', ref: 'https://facebook.com/x' }), 'tag:poster');
});

test('sourceOf recognizes a referrer host against the known-source list', () => {
	assert.equal(sourceOf({ ref: 'https://www.facebook.com/somepage' }), 'Facebook');
	assert.equal(sourceOf({ ref: 'https://www.google.com/search?q=x' }), 'Search');
});

test('sourceOf falls back to the in-app browser signature in the user agent', () => {
	assert.equal(sourceOf({ ua: 'Mozilla/5.0 Instagram 123.0' }), 'Instagram');
});

test('sourceOf is Direct with no src, ref, or recognizable ua', () => {
	assert.equal(sourceOf({}), 'Direct');
});

test('sourceOf is Other websites for an unrecognized referrer', () => {
	assert.equal(sourceOf({ ref: 'https://some-random-blog.example' }), 'Other websites');
});

test('looksLikeBot catches common crawler signatures and empty user agents', () => {
	assert.equal(looksLikeBot(''), true);
	assert.equal(looksLikeBot(null), true);
	assert.equal(looksLikeBot('Googlebot/2.1'), true);
	assert.equal(looksLikeBot('curl/8.0'), true);
	assert.equal(
		looksLikeBot('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'),
		false
	);
});

test('markFor is stable for the same inputs and changes with the day, ip, or ua', () => {
	const a = markFor('secret', '2026-01-01', '1.2.3.4', 'Mozilla/5.0');
	const b = markFor('secret', '2026-01-01', '1.2.3.4', 'Mozilla/5.0');
	const differentDay = markFor('secret', '2026-01-02', '1.2.3.4', 'Mozilla/5.0');
	const differentIp = markFor('secret', '2026-01-01', '5.6.7.8', 'Mozilla/5.0');
	assert.equal(a, b);
	assert.notEqual(a, differentDay);
	assert.notEqual(a, differentIp);
});

test('buildReport fills every day in the window even with no rows', () => {
	const report = buildReport([], 3, new Date('2026-01-10T00:00:00Z').getTime());
	assert.equal(report.series.length, 3);
	assert.deepEqual(report.series.map((d) => d.day), ['2026-01-08', '2026-01-09', '2026-01-10']);
	assert.equal(report.views, 0);
	assert.equal(report.rate, 0);
});

test('buildReport sums views/visitors/clicks per day and computes the click-through rate', () => {
	const now = new Date('2026-01-10T00:00:00Z').getTime();
	const rows = [
		{ day: '2026-01-10', metric: 'view', key: '', label: '', n: 20 },
		{ day: '2026-01-10', metric: 'visitor', key: '', label: '', n: 10 },
		{ day: '2026-01-10', metric: 'click', key: '/give', label: 'Give', n: 4 },
		{ day: '2026-01-10', metric: 'source', key: 'Facebook', label: '', n: 6 },
		{ day: '2026-01-10', metric: 'source', key: 'tag:poster', label: '', n: 4 },
		{ day: '2026-01-09', metric: 'campaign', key: 'ig|social|bio|launch', label: '', n: 2 },
		// a row outside the window is ignored rather than crashing on a missing day
		{ day: '2025-01-01', metric: 'view', key: '', label: '', n: 99 }
	];
	const report = buildReport(rows, 2, now);
	assert.equal(report.views, 20);
	assert.equal(report.visitors, 10);
	assert.equal(report.clicks, 4);
	assert.equal(report.rate, 40);
	assert.deepEqual(report.links, [{ href: '/give', label: 'Give', n: 4 }]);
	assert.deepEqual(report.sources, [
		{ name: 'Facebook', tag: false, n: 6 },
		{ name: 'poster', tag: true, n: 4 }
	]);
	assert.deepEqual(report.campaigns, [{ source: 'ig', medium: 'social', content: 'bio', campaign: 'launch', n: 2 }]);
});
