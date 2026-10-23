/**
 * Service-layer tests with a fake database, following the pattern in
 * `modules/inquiries/service.test.ts`.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { createFormGuardService, throttleMessage } from './service.js';
import { FORM_TOKEN_FIELD } from './form-token.js';

const SECRET = 'k'.repeat(48);
const NOW = new Date('2026-10-23T09:00:00Z');

type Counter = { count: number; windowStartedAt: Date };

/**
 * Stands in for the one statement the repository runs: an upsert that returns
 * the counter row. `counted` records how many times it was reached, which is
 * how the tests assert that a forged submission never gets as far as a write.
 */
function fakeDb(returning: Counter = { count: 1, windowStartedAt: NOW }) {
	const state = { counted: 0 };

	const builder: any = {
		insert: () => builder,
		values: () => builder,
		onConflictDoUpdate: () => builder,
		delete: () => builder,
		where: () => Promise.resolve(undefined),
		returning: () => {
			state.counted += 1;
			return Promise.resolve([returning]);
		}
	};

	return { db: builder, state };
}

function guard(returning?: Counter, limit = 5) {
	const { db, state } = fakeDb(returning);
	return {
		service: createFormGuardService(db, { secretKey: SECRET, limit }),
		state
	};
}

test('a submission with a fresh token for this form is allowed', async () => {
	const { service, state } = guard();
	const token = service.issueToken('contact', NOW);

	const verdict = await service.check({
		formName: 'contact',
		address: '41.221.0.1',
		token,
		now: NOW
	});

	assert.deepEqual(verdict, { ok: true });
	assert.equal(state.counted, 1);
});

test('a filled honeypot is refused before anything is written', async () => {
	const { service, state } = guard();

	const verdict = await service.check({
		formName: 'contact',
		address: '41.221.0.1',
		token: service.issueToken('contact'),
		honeypot: 'http://spam.example',
		now: NOW
	});

	assert.deepEqual(verdict, { ok: false, kind: 'honeypot' });
	// The counter is a write: a bot that fills every field must not be able to
	// make the database do work, nor use up the real visitor's allowance.
	assert.equal(state.counted, 0);
});

test('a POST with no token is refused before anything is written', async () => {
	const { service, state } = guard();

	const verdict = await service.check({
		formName: 'contact',
		address: '41.221.0.1',
		token: undefined,
		now: NOW
	});

	assert.equal(verdict.ok, false);
	if (verdict.ok) return;
	assert.equal(verdict.kind, 'token');
	assert.equal(state.counted, 0);
});

test('a token minted for another form does not open this one', async () => {
	const { service } = guard();
	const verdict = await service.check({
		formName: 'prayer',
		address: '41.221.0.1',
		token: service.issueToken('newsletter'),
		now: NOW
	});

	assert.equal(verdict.ok, false);
	if (!verdict.ok && verdict.kind === 'token') assert.equal(verdict.reason, 'tampered');
});

test('a visitor past the limit is throttled and told when to retry', async () => {
	const { service } = guard({ count: 6, windowStartedAt: new Date(NOW.getTime() - 60_000) }, 5);

	const verdict = await service.check({
		formName: 'contact',
		address: '41.221.0.1',
		token: service.issueToken('contact', NOW),
		now: NOW
	});

	assert.equal(verdict.ok, false);
	if (verdict.ok || verdict.kind !== 'throttled') return assert.fail('expected a throttle');
	assert.equal(verdict.retryAfterSeconds, 540);
	assert.equal(
		throttleMessage(verdict.retryAfterSeconds),
		'Too many submissions. Please try again in 9 minutes.'
	);
});

test('one minute left reads as a single minute, not "1 minutes"', () => {
	assert.equal(throttleMessage(45), 'Too many submissions. Please try again in 1 minute.');
});

test('a missing secret fails loudly rather than signing with nothing', () => {
	const { db } = fakeDb();
	const service = createFormGuardService(db, { secretKey: undefined });
	assert.throws(() => service.issueToken('contact'), /SECRET_KEY/);
});

test('the hidden field has a stable name, because every form renders it', () => {
	assert.equal(FORM_TOKEN_FIELD, '_ft');
});
