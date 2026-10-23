import test from 'node:test';
import assert from 'node:assert/strict';
import {
	MAX_TOKEN_AGE_MS,
	createFormToken,
	decideFromCounter,
	verifyFormToken
} from './form-token.js';

const SECRET = 'a'.repeat(40);
const NOW = new Date('2026-10-23T09:00:00Z');

test('a freshly minted token verifies for the form it was minted for', () => {
	const token = createFormToken(SECRET, 'contact', NOW);
	assert.deepEqual(verifyFormToken(SECRET, 'contact', token, NOW), { ok: true });
});

test('a token minted for one form is refused on another', () => {
	// Otherwise the newsletter's token would open the prayer form, and one
	// scraped token would unlock every form on the site.
	const token = createFormToken(SECRET, 'newsletter', NOW);
	assert.deepEqual(verifyFormToken(SECRET, 'prayer', token, NOW), {
		ok: false,
		reason: 'tampered'
	});
});

test('a missing or malformed token is refused, not crashed on', () => {
	for (const value of [undefined, null, '', '   ', 'nonsense', 'abc.def', '.', '123.']) {
		const result = verifyFormToken(SECRET, 'contact', value as string | undefined, NOW);
		assert.equal(result.ok, false, JSON.stringify(value));
	}
	assert.deepEqual(verifyFormToken(SECRET, 'contact', undefined, NOW), {
		ok: false,
		reason: 'missing'
	});
});

test('an edited timestamp invalidates the signature', () => {
	const token = createFormToken(SECRET, 'contact', NOW);
	const [, signature] = token.split('.');
	const forged = `${NOW.getTime() + 60_000}.${signature}`;
	assert.deepEqual(verifyFormToken(SECRET, 'contact', forged, NOW), {
		ok: false,
		reason: 'tampered'
	});
});

test('a token signed with a different secret is refused', () => {
	const token = createFormToken('b'.repeat(40), 'contact', NOW);
	assert.deepEqual(verifyFormToken(SECRET, 'contact', token, NOW), {
		ok: false,
		reason: 'tampered'
	});
});

test('a token older than the window is stale', () => {
	const token = createFormToken(SECRET, 'contact', NOW);
	const justInside = new Date(NOW.getTime() + MAX_TOKEN_AGE_MS - 1000);
	const justOutside = new Date(NOW.getTime() + MAX_TOKEN_AGE_MS + 1000);

	assert.deepEqual(verifyFormToken(SECRET, 'contact', token, justInside), { ok: true });
	assert.deepEqual(verifyFormToken(SECRET, 'contact', token, justOutside), {
		ok: false,
		reason: 'stale'
	});
});

test('the window outlasts a CDN-cached page, or every visitor would be refused', () => {
	// A form page is served with `s-maxage=3600, stale-while-revalidate=86400`,
	// so the HTML a visitor receives — and the token baked into it — can be up
	// to 25 hours old through no fault of theirs.
	assert.ok(MAX_TOKEN_AGE_MS > (3600 + 86_400) * 1000);
});

test('a token from the future is refused beyond a little clock skew', () => {
	const token = createFormToken(SECRET, 'contact', new Date(NOW.getTime() + 30_000));
	assert.deepEqual(verifyFormToken(SECRET, 'contact', token, NOW), { ok: true });

	const wayAhead = createFormToken(SECRET, 'contact', new Date(NOW.getTime() + 60 * 60_000));
	assert.deepEqual(verifyFormToken(SECRET, 'contact', wayAhead, NOW), {
		ok: false,
		reason: 'tampered'
	});
});

test('an uncached form can also demand the visitor took a moment to type', () => {
	// Off by default: on a CDN-cached page the token is minted when the cache
	// was filled, not when the visitor opened the page, so the gap says nothing
	// about how fast they filled it in. A page served `private, no-store` can
	// opt in.
	const token = createFormToken(SECRET, 'contact', NOW);
	const instant = new Date(NOW.getTime() + 500);

	assert.deepEqual(verifyFormToken(SECRET, 'contact', token, instant), { ok: true });
	assert.deepEqual(verifyFormToken(SECRET, 'contact', token, instant, { minAgeMs: 3000 }), {
		ok: false,
		reason: 'premature'
	});
});

test('a counter inside its limit is allowed, and the one past it is not', () => {
	const options = { limit: 3, windowMs: 600_000 };
	const started = NOW;

	for (const count of [1, 2, 3]) {
		assert.equal(
			decideFromCounter({ count, windowStartedAt: started }, NOW, options).allowed,
			true,
			`count ${count}`
		);
	}
	assert.equal(
		decideFromCounter({ count: 4, windowStartedAt: started }, NOW, options).allowed,
		false
	);
});

test('a throttled caller is told how long the window has left, rounded up', () => {
	const options = { limit: 1, windowMs: 600_000 };
	const started = new Date(NOW.getTime() - 90_000);
	const result = decideFromCounter({ count: 5, windowStartedAt: started }, NOW, options);

	assert.equal(result.allowed, false);
	assert.equal(result.retryAfterSeconds, 510);
});

test('an allowed caller is given no retry delay to show', () => {
	const result = decideFromCounter({ count: 1, windowStartedAt: NOW }, NOW, {
		limit: 5,
		windowMs: 600_000
	});
	assert.deepEqual(result, { allowed: true, retryAfterSeconds: 0 });
});

test('a window that has already elapsed never reports a negative delay', () => {
	const started = new Date(NOW.getTime() - 10 * 600_000);
	const result = decideFromCounter({ count: 99, windowStartedAt: started }, NOW, {
		limit: 1,
		windowMs: 600_000
	});
	assert.equal(result.retryAfterSeconds, 0);
});
