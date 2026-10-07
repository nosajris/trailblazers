import test from 'node:test';
import assert from 'node:assert/strict';
import { searchItems, searchTerms, type SearchItem } from './search.js';

const items: SearchItem[] = [
	{ id: 'e1', kind: 'event', title: 'Winter Camp', subtitle: 'Sat 12 Jul', href: '/events/1' },
	{ id: 'g1', kind: 'group', title: 'MSU Ignite', subtitle: 'Wed 18:00', href: '/groups#group-1', keywords: 'Tariro campus' },
	{ id: 's1', kind: 'sermon', title: 'Camp Highlights', subtitle: 'Pastor Zowa', href: '/watch' },
	{ id: 'p1', kind: 'page', title: 'Plan a visit', href: '/plan-a-visit' },
	{ id: 'g2', kind: 'group', title: 'Marketplace Leaders', subtitle: 'Thu 19:00', href: '/groups#group-2' }
];

test('an empty query matches nothing', () => {
	assert.deepEqual(searchItems(items, ''), []);
	assert.deepEqual(searchItems(items, '   '), []);
	assert.deepEqual(searchItems(items, '!!!'), []);
	assert.deepEqual(searchTerms('  Winter   CAMP! '), ['winter', 'camp']);
});

test('a title that starts with the term outranks one that merely contains it', () => {
	// "Camp Highlights" starts with the term; "Winter Camp" has it later; "MSU
	// Ignite" only matches on its hidden keyword "campus".
	assert.deepEqual(searchItems(items, 'camp').map((h) => h.id), ['s1', 'e1', 'g1']);
});

test('every term must match somewhere, so an unmatched word excludes the item', () => {
	assert.deepEqual(searchItems(items, 'msu ignite').map((h) => h.id), ['g1']);
	assert.deepEqual(searchItems(items, 'ignite zebra'), []);
	assert.deepEqual(searchItems(items, 'winter camp').map((h) => h.id), ['e1']);
});

test('hidden keywords and subtitles match but rank below titles', () => {
	assert.deepEqual(searchItems(items, 'tariro').map((h) => h.id), ['g1']);
	assert.deepEqual(searchItems(items, 'zowa').map((h) => h.id), ['s1']);
});

test('matching is case and accent insensitive', () => {
	assert.deepEqual(searchItems(items, 'IGNITE').map((h) => h.id), ['g1']);
	assert.deepEqual(searchItems([{ id: 'a', kind: 'page', title: 'Café', href: '/c' }], 'cafe').map((h) => h.id), ['a']);
});

test('the limit is respected and ties break alphabetically', () => {
	assert.equal(searchItems(items, 'a', 2).length, 2);
	const ties: SearchItem[] = [
		{ id: 'b', kind: 'group', title: 'Beta', href: '/b' },
		{ id: 'a', kind: 'group', title: 'Alpha', href: '/a' }
	];
	assert.deepEqual(searchItems(ties, 'a').map((h) => h.id), ['a', 'b']);
});

test('a term with regex characters is treated as text', () => {
	const odd: SearchItem[] = [{ id: 'x', kind: 'page', title: 'C++ (notes)', href: '/x' }];
	assert.deepEqual(searchItems(odd, 'c++').map((h) => h.id), ['x']);
	assert.deepEqual(searchItems(odd, 'notes').map((h) => h.id), ['x']);
});
