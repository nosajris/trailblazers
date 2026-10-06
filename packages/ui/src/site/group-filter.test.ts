import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterGroups, groupTypesPresent } from './group-filter.js';

const g = [
	{ name: 'MSU Ignite', leader: 'Tariro', dayTime: 'Wed 6pm', type: 'CAMPUS', description: 'Students' },
	{ name: 'Marketplace', leader: 'Farai', dayTime: 'Thu 7pm', type: 'PRO', description: null },
	{ name: 'Zoom Prayer', leader: 'Ruth', dayTime: 'Mon 8pm', type: 'ONLINE' }
];

test('ALL and empty query returns everything', () => {
	assert.equal(filterGroups(g, 'ALL', '').length, 3);
	assert.equal(filterGroups(g, '', '  ').length, 3);
});
test('filters by type', () => {
	assert.deepEqual(filterGroups(g, 'PRO', '').map((x) => x.name), ['Marketplace']);
});
test('search is case-insensitive across fields and all terms must match', () => {
	assert.deepEqual(filterGroups(g, 'ALL', 'tariro wed').map((x) => x.name), ['MSU Ignite']);
	assert.deepEqual(filterGroups(g, 'ALL', 'STUDENTS').map((x) => x.name), ['MSU Ignite']);
	assert.equal(filterGroups(g, 'ALL', 'tariro thu').length, 0);
});
test('type and query combine', () => {
	assert.equal(filterGroups(g, 'ONLINE', 'tariro').length, 0);
});
test('types present are ordered and unique', () => {
	assert.deepEqual(groupTypesPresent([...g, g[0]]), ['CAMPUS', 'PRO', 'ONLINE']);
});
