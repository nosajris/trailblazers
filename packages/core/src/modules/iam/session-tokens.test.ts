/**
 * Session token tests.
 *
 *   node --experimental-strip-types --test packages/core/src/modules/iam/session-tokens.test.ts
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
	ABSOLUTE_TTL_MS,
	IDLE_TTL_MS,
	assertUsableSecret,
	createSessionToken,
	decideRefresh,
	hashSessionToken,
	hashesMatch
} from './session-tokens.ts';

const SECRET = 'a'.repeat(48);
const OTHER_SECRET = 'b'.repeat(48);

test('a minted token is not the value stored in the database', () => {
	const { token, tokenHash } = createSessionToken(SECRET);
	assert.notEqual(token, tokenHash);
	assert.equal(tokenHash.length, 64, 'sha256 hex');
});

test('tokens are unpredictable', () => {
	const seen = new Set<string>();
	for (let i = 0; i < 500; i++) seen.add(createSessionToken(SECRET).token);
	assert.equal(seen.size, 500, 'no collisions across 500 tokens');
});

test('hashing is deterministic, so a cookie can be looked up', () => {
	const { token, tokenHash } = createSessionToken(SECRET);
	assert.equal(hashSessionToken(token, SECRET), tokenHash);
});

test('the hash is keyed: the same token under another secret does not match', () => {
	const { token, tokenHash } = createSessionToken(SECRET);
	assert.notEqual(hashSessionToken(token, OTHER_SECRET), tokenHash);
});

test('a stolen hash cannot be replayed as a cookie', () => {
	// The attack this defends against: someone reads the sessions table and
	// tries to use the stored value as the token.
	const { tokenHash } = createSessionToken(SECRET);
	assert.notEqual(hashSessionToken(tokenHash, SECRET), tokenHash);
});

test('a weak or missing secret is refused', () => {
	assert.throws(() => assertUsableSecret(undefined), /not set/);
	assert.throws(() => assertUsableSecret(''), /not set/);
	assert.throws(() => assertUsableSecret('   '), /not set/);
	assert.throws(() => assertUsableSecret('short'), /too short/);
	assert.throws(
		() => assertUsableSecret('super_secret_production_key_change_me'),
		/example value/
	);
	assert.doesNotThrow(() => assertUsableSecret(SECRET));
});

test('hashesMatch compares equal and unequal values correctly', () => {
	assert.equal(hashesMatch('abc', 'abc'), true);
	assert.equal(hashesMatch('abc', 'abd'), false);
	assert.equal(hashesMatch('abc', 'abcd'), false);
});

function windowOf(createdAgoMs: number, expiresInMs: number, now: Date) {
	return {
		createdAt: new Date(now.getTime() - createdAgoMs),
		expiresAt: new Date(now.getTime() + expiresInMs)
	};
}

test('a session past its expiry is expired', () => {
	const now = new Date('2026-08-31T12:00:00Z');
	const decision = decideRefresh(windowOf(1000, -1, now), now);
	assert.equal(decision.action, 'expired');
});

test('a fresh session is kept without a write', () => {
	const now = new Date('2026-08-31T12:00:00Z');
	const decision = decideRefresh(windowOf(60_000, IDLE_TTL_MS, now), now);
	assert.equal(decision.action, 'keep', 'no database write on every request');
});

test('a session past halfway is extended', () => {
	const now = new Date('2026-08-31T12:00:00Z');
	const decision = decideRefresh(windowOf(4 * 24 * 3600_000, IDLE_TTL_MS * 0.4, now), now);
	assert.equal(decision.action, 'extend');
	if (decision.action === 'extend') {
		assert.equal(decision.expiresAt.getTime(), now.getTime() + IDLE_TTL_MS);
	}
});

test('extension never exceeds the absolute ceiling', () => {
	const now = new Date('2026-08-31T12:00:00Z');
	// Created 29 days ago: only one day of absolute life remains.
	const createdAgo = 29 * 24 * 3600_000;
	const decision = decideRefresh(windowOf(createdAgo, IDLE_TTL_MS * 0.1, now), now);

	assert.equal(decision.action, 'extend');
	if (decision.action === 'extend') {
		const absoluteDeadline = now.getTime() - createdAgo + ABSOLUTE_TTL_MS;
		assert.equal(decision.expiresAt.getTime(), absoluteDeadline);
		assert.ok(
			decision.expiresAt.getTime() < now.getTime() + IDLE_TTL_MS,
			'clamped below a full idle window'
		);
	}
});

test('an old session cannot be kept alive forever by using it', () => {
	// The regression this guards: sliding expiry with no ceiling means a session
	// that is touched weekly never dies.
	const now = new Date('2026-08-31T12:00:00Z');
	const decision = decideRefresh(windowOf(ABSOLUTE_TTL_MS + 1000, IDLE_TTL_MS, now), now);
	assert.equal(decision.action, 'expired', 'past the absolute age, however active');
});

test('an expiry is never moved backwards', () => {
	const now = new Date('2026-08-31T12:00:00Z');
	// Already expires later than a fresh idle window would allow.
	const decision = decideRefresh(windowOf(1000, IDLE_TTL_MS * 2, now), now);
	assert.equal(decision.action, 'keep');
});
