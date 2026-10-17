import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isTrackablePageView } from './request-filter.js';

const base = { method: 'GET', pathname: '/events', accept: null, isDataRequest: false };

test('a hard navigation (accept: text/html) is trackable', () => {
	assert.equal(isTrackablePageView({ ...base, accept: 'text/html,application/xhtml+xml' }), true);
});

test('a client-side navigation data fetch is trackable', () => {
	assert.equal(isTrackablePageView({ ...base, accept: '*/*', isDataRequest: true }), true);
});

test('an asset request (no html accept, not a data request) is not trackable', () => {
	assert.equal(isTrackablePageView({ ...base, pathname: '/_app/immutable/chunks/x.js', accept: '*/*' }), false);
});

test('a file with any extension is never trackable, even if it asks for html', () => {
	assert.equal(isTrackablePageView({ ...base, pathname: '/robots.txt', accept: 'text/html' }), false);
	assert.equal(isTrackablePageView({ ...base, pathname: '/sitemap.xml', accept: 'text/html' }), false);
});

test('an API call is never trackable', () => {
	assert.equal(isTrackablePageView({ ...base, pathname: '/api/media', accept: 'text/html', isDataRequest: true }), false);
});

test('a non-GET request is never trackable', () => {
	assert.equal(isTrackablePageView({ ...base, method: 'POST', accept: 'text/html' }), false);
});
