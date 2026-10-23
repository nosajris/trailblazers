import test from 'node:test';
import assert from 'node:assert/strict';
import {
	PREVIEW_TOKEN_TTL_MS,
	createPagePreviewToken,
	isDueForPublish,
	pendingChanges,
	previewPath,
	verifyPagePreviewToken
} from './publishing.js';

const SECRET = 'p'.repeat(40);
const NOW = new Date('2026-10-23T09:00:00Z');

type Row = Parameters<typeof pendingChanges>[0][number];

function row(over: Partial<Row> = {}): Row {
	return {
		id: 1,
		status: 'PUBLISHED',
		draftConfig: null,
		draftSortOrder: null,
		publishedAt: new Date('2026-10-01T00:00:00Z'),
		pendingDelete: false,
		...over
	};
}

test('a page with nothing changed has nothing to publish', () => {
	const changes = pendingChanges([row(), row({ id: 2 })]);
	assert.deepEqual(changes, { edits: 0, additions: 0, deletions: 0, reorders: 0, total: 0 });
});

test('an edited section counts as an edit', () => {
	const changes = pendingChanges([row({ draftConfig: { title: 'New' } }), row({ id: 2 })]);
	assert.equal(changes.edits, 1);
	assert.equal(changes.total, 1);
});

test('a section that has never been published counts as an addition, not an edit', () => {
	// Staff reading "1 change" want to know whether they are about to add
	// something new or alter something visitors already saw.
	const changes = pendingChanges([row({ publishedAt: null, draftConfig: { title: 'New' } })]);
	assert.equal(changes.additions, 1);
	assert.equal(changes.edits, 0);
	assert.equal(changes.total, 1);
});

test('a section marked for removal counts as a deletion', () => {
	const changes = pendingChanges([row({ pendingDelete: true })]);
	assert.deepEqual(changes, { edits: 0, additions: 0, deletions: 1, reorders: 0, total: 1 });
});

test('a moved section counts as a reorder', () => {
	const changes = pendingChanges([row({ draftSortOrder: 30 })]);
	assert.equal(changes.reorders, 1);
	assert.equal(changes.total, 1);
});

test('a section both moved and edited is one change, not two', () => {
	// The count is of sections to publish, so staff are not told "2 changes"
	// for one section they touched twice.
	const changes = pendingChanges([row({ draftConfig: { title: 'New' }, draftSortOrder: 30 })]);
	assert.equal(changes.total, 1);
	assert.equal(changes.edits, 1);
	assert.equal(changes.reorders, 1);
});

test('a removal wins over an edit on the same section', () => {
	// It is about to be deleted; describing it as an edit would be misleading.
	const changes = pendingChanges([row({ pendingDelete: true, draftConfig: { title: 'x' } })]);
	assert.equal(changes.deletions, 1);
	assert.equal(changes.edits, 0);
	assert.equal(changes.total, 1);
});

test('a page is due when its scheduled time has arrived', () => {
	assert.equal(isDueForPublish({ publishAt: new Date('2026-10-23T08:59:00Z') }, NOW), true);
	assert.equal(isDueForPublish({ publishAt: NOW }, NOW), true);
});

test('a page scheduled for later is not due, and one with no schedule never is', () => {
	assert.equal(isDueForPublish({ publishAt: new Date('2026-10-23T09:01:00Z') }, NOW), false);
	assert.equal(isDueForPublish({ publishAt: null }, NOW), false);
});

test('a preview token opens the page it was made for', () => {
	const token = createPagePreviewToken(SECRET, 7, NOW);
	assert.equal(verifyPagePreviewToken(SECRET, 7, token, NOW), true);
});

test('a preview token does not open a different page', () => {
	// Otherwise one shared link would open every draft on the site.
	const token = createPagePreviewToken(SECRET, 7, NOW);
	assert.equal(verifyPagePreviewToken(SECRET, 8, token, NOW), false);
});

test('a preview token expires', () => {
	const token = createPagePreviewToken(SECRET, 7, NOW);
	const almost = new Date(NOW.getTime() + PREVIEW_TOKEN_TTL_MS - 1000);
	const after = new Date(NOW.getTime() + PREVIEW_TOKEN_TTL_MS + 1000);

	assert.equal(verifyPagePreviewToken(SECRET, 7, token, almost), true);
	assert.equal(verifyPagePreviewToken(SECRET, 7, token, after), false);
});

test('a tampered or missing preview token is refused', () => {
	const token = createPagePreviewToken(SECRET, 7, NOW);
	const [expiry] = token.split('.');

	assert.equal(verifyPagePreviewToken(SECRET, 7, `${expiry}.deadbeef`, NOW), false);
	assert.equal(verifyPagePreviewToken(SECRET, 7, 'nonsense', NOW), false);
	assert.equal(verifyPagePreviewToken(SECRET, 7, '', NOW), false);
	assert.equal(verifyPagePreviewToken(SECRET, 7, undefined, NOW), false);
	assert.equal(verifyPagePreviewToken('q'.repeat(40), 7, token, NOW), false);
});

test('extending the expiry by hand does not extend the token', () => {
	const token = createPagePreviewToken(SECRET, 7, NOW);
	const [, signature] = token.split('.');
	const forged = `${NOW.getTime() + 999 * 60_000}.${signature}`;
	assert.equal(verifyPagePreviewToken(SECRET, 7, forged, NOW), false);
});

test('the preview link carries the page and its token', () => {
	const token = createPagePreviewToken(SECRET, 7, NOW);
	assert.equal(previewPath(7, token), `/preview/7?t=${encodeURIComponent(token)}`);
});
