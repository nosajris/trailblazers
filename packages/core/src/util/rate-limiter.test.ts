/**
 * Rate limiter tests.
 *
 *   node --experimental-strip-types --test packages/core/src/util/rate-limiter.test.ts
 *
 * The clock is injected so windows can be advanced without sleeping.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { createRateLimiter } from './rate-limiter.ts';

function fakeClock(start = 1_000_000) {
	let current = start;
	return {
		now: () => current,
		advance(ms: number) {
			current += ms;
		}
	};
}

test('allows up to the limit, then blocks', () => {
	const clock = fakeClock();
	const limiter = createRateLimiter({ limit: 3, windowMs: 60_000, now: clock.now });

	assert.deepEqual(limiter.consume('ip'), { allowed: true, remaining: 2, retryAfterSeconds: 0 });
	assert.deepEqual(limiter.consume('ip'), { allowed: true, remaining: 1, retryAfterSeconds: 0 });
	assert.deepEqual(limiter.consume('ip'), { allowed: true, remaining: 0, retryAfterSeconds: 0 });

	const blocked = limiter.consume('ip');
	assert.equal(blocked.allowed, false);
	assert.equal(blocked.remaining, 0);
	assert.equal(blocked.retryAfterSeconds, 60);
});

test('keys are independent', () => {
	const clock = fakeClock();
	const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, now: clock.now });

	assert.equal(limiter.consume('a').allowed, true);
	assert.equal(limiter.consume('a').allowed, false);
	assert.equal(limiter.consume('b').allowed, true, 'a different key has its own window');
});

test('the window reopens once it expires', () => {
	const clock = fakeClock();
	const limiter = createRateLimiter({ limit: 2, windowMs: 60_000, now: clock.now });

	limiter.consume('ip');
	limiter.consume('ip');
	assert.equal(limiter.consume('ip').allowed, false);

	clock.advance(59_999);
	assert.equal(limiter.consume('ip').allowed, false, 'still inside the window');

	clock.advance(1);
	assert.equal(limiter.consume('ip').allowed, true, 'window elapsed, counting restarts');
});

test('retryAfterSeconds counts down as the window drains', () => {
	const clock = fakeClock();
	const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, now: clock.now });

	limiter.consume('ip');
	assert.equal(limiter.consume('ip').retryAfterSeconds, 60);

	clock.advance(30_000);
	assert.equal(limiter.consume('ip').retryAfterSeconds, 30);

	clock.advance(29_500);
	assert.equal(limiter.consume('ip').retryAfterSeconds, 1, 'rounds up, never reports 0 while blocked');
});

test('staying blocked does not extend the window', () => {
	const clock = fakeClock();
	const limiter = createRateLimiter({ limit: 1, windowMs: 10_000, now: clock.now });

	limiter.consume('ip');
	for (let i = 0; i < 50; i++) {
		clock.advance(100);
		limiter.consume('ip');
	}
	// 50 * 100ms = 5s of hammering; the original window still expires on time.
	clock.advance(5_000);
	assert.equal(limiter.consume('ip').allowed, true);
});

test('peek reports state without consuming', () => {
	const clock = fakeClock();
	const limiter = createRateLimiter({ limit: 2, windowMs: 60_000, now: clock.now });

	assert.deepEqual(limiter.peek('ip'), { allowed: true, remaining: 2, retryAfterSeconds: 0 });
	limiter.consume('ip');
	assert.deepEqual(limiter.peek('ip'), { allowed: true, remaining: 1, retryAfterSeconds: 0 });
	assert.deepEqual(limiter.peek('ip'), { allowed: true, remaining: 1, retryAfterSeconds: 0 });

	limiter.consume('ip');
	assert.equal(limiter.peek('ip').allowed, false);
});

test('reset clears a single key, as a successful login should', () => {
	const clock = fakeClock();
	const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, now: clock.now });

	limiter.consume('user@example.com');
	limiter.consume('other@example.com');
	assert.equal(limiter.consume('user@example.com').allowed, false);

	limiter.reset('user@example.com');
	assert.equal(limiter.consume('user@example.com').allowed, true);
	assert.equal(limiter.consume('other@example.com').allowed, false, 'other keys untouched');
});

test('expired entries are pruned rather than accumulating', () => {
	const clock = fakeClock();
	const limiter = createRateLimiter({ limit: 5, windowMs: 1_000, now: clock.now, maxKeys: 10 });

	for (let i = 0; i < 10; i++) limiter.consume(`key-${i}`);
	assert.equal(limiter.size(), 10);

	clock.advance(1_001);
	limiter.consume('fresh');
	assert.ok(limiter.size() <= 2, `expected pruning, got ${limiter.size()} keys`);
});

test('a flood of unique keys cannot grow memory without bound', () => {
	const clock = fakeClock();
	const limiter = createRateLimiter({ limit: 5, windowMs: 600_000, now: clock.now, maxKeys: 50 });

	for (let i = 0; i < 500; i++) limiter.consume(`key-${i}`);
	assert.ok(limiter.size() <= 50, `expected the map to stay capped, got ${limiter.size()}`);
});

test('rejects nonsensical configuration', () => {
	assert.throws(() => createRateLimiter({ limit: 0, windowMs: 1000 }));
	assert.throws(() => createRateLimiter({ limit: 1, windowMs: 0 }));
});
