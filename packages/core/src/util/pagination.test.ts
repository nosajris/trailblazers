/**
 * Pagination tests.
 *
 *   npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	paginate,
	readPageRequest
} from './pagination.js';

const params = (query: string) => new URLSearchParams(query);

test('defaults apply when nothing is supplied', () => {
	const request = readPageRequest(params(''));
	assert.deepEqual(request, { page: 1, pageSize: DEFAULT_PAGE_SIZE, offset: 0 });
});

test('page and size are read and the offset derived', () => {
	const request = readPageRequest(params('page=3&pageSize=10'));
	assert.deepEqual(request, { page: 3, pageSize: 10, offset: 20 });
});

test('an oversized pageSize is capped', () => {
	// Without this, ?pageSize=1000000 is a free denial-of-service on a pool of
	// one connection.
	const request = readPageRequest(params('pageSize=999999'));
	assert.equal(request.pageSize, MAX_PAGE_SIZE);
});

test('junk falls back to the defaults rather than erroring', () => {
	for (const query of ['page=abc', 'page=0', 'page=-4', 'page=1.9e400', 'pageSize=-10']) {
		const request = readPageRequest(params(query));
		assert.ok(request.page >= 1, `${query} -> page ${request.page}`);
		assert.ok(request.pageSize >= 1, `${query} -> size ${request.pageSize}`);
		assert.ok(request.offset >= 0, `${query} -> offset ${request.offset}`);
	}
});

test('a fractional page is floored, not passed to SQL', () => {
	assert.equal(readPageRequest(params('page=2.7')).page, 2);
});

test('paginate reports the surrounding numbers', () => {
	const result = paginate(['a', 'b'], 5, { page: 1, pageSize: 2, offset: 0 });

	assert.deepEqual(result, {
		items: ['a', 'b'],
		page: 1,
		pageSize: 2,
		total: 5,
		totalPages: 3,
		hasPrevious: false,
		hasNext: true
	});
});

test('the middle and last pages report their neighbours correctly', () => {
	const middle = paginate(['c', 'd'], 5, { page: 2, pageSize: 2, offset: 2 });
	assert.equal(middle.hasPrevious, true);
	assert.equal(middle.hasNext, true);

	const last = paginate(['e'], 5, { page: 3, pageSize: 2, offset: 4 });
	assert.equal(last.hasPrevious, true);
	assert.equal(last.hasNext, false);
});

test('an empty result set has no pages and no next', () => {
	const result = paginate([], 0, { page: 1, pageSize: 25, offset: 0 });
	assert.equal(result.totalPages, 0);
	assert.equal(result.hasNext, false);
	assert.equal(result.hasPrevious, false);
});

test('a page beyond the end reports no next page', () => {
	const result = paginate([], 5, { page: 99, pageSize: 2, offset: 196 });
	assert.equal(result.hasNext, false);
	assert.equal(result.hasPrevious, true);
});
