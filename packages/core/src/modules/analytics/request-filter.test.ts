import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isTrackablePageView, shouldCountView } from './request-filter.js';

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

const countable = {
	...base,
	accept: 'text/html',
	dnt: null,
	globalPrivacyControl: null,
	isStaff: false
};

test('an ordinary visitor on a real page is counted', () => {
	assert.equal(shouldCountView(countable), true);
});

test('a visitor who asked not to be tracked is not counted', () => {
	// DNT is a request, and this is our own first-party counter, so honouring it
	// costs nothing but the count.
	assert.equal(shouldCountView({ ...countable, dnt: '1' }), false);
	// Only an explicit 1 is a request; '0' and anything else are not.
	assert.equal(shouldCountView({ ...countable, dnt: '0' }), true);
	assert.equal(shouldCountView({ ...countable, dnt: 'unspecified' }), true);
});

test('Global Privacy Control is honoured the same way', () => {
	assert.equal(shouldCountView({ ...countable, globalPrivacyControl: '1' }), false);
	assert.equal(shouldCountView({ ...countable, globalPrivacyControl: '0' }), true);
});

test("a signed-in staff member's own visits are not counted", () => {
	// Staff open the site all day while editing it. Counting them makes the
	// numbers mostly about the office.
	assert.equal(shouldCountView({ ...countable, isStaff: true }), false);
});

test('a request that was never a page view is still not counted', () => {
	assert.equal(shouldCountView({ ...countable, method: 'POST' }), false);
	assert.equal(shouldCountView({ ...countable, pathname: '/api/media' }), false);
});
