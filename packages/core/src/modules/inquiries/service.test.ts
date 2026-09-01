/**
 * Service-layer tests with a fake database.
 *
 *   npm test
 *
 * This is the pattern to copy for the other modules. Services take a `Database`
 * and only ever call a handful of Drizzle methods on it, so a small hand-rolled
 * fake is enough to assert the business rules — no Postgres, no fixtures, and
 * fast enough to run on every save.
 *
 * `packages/core` had no tests at all before this: every service, and so every
 * business rule in the product, was unverified.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { createInquiryService, NEWSLETTER_CONSENT_TEXT } from './service.ts';

const SECRET = 'k'.repeat(48);

type Row = Record<string, unknown>;

/**
 * A stand-in for the Drizzle query builder.
 *
 * It records what was asked of it and replays canned rows. Each builder method
 * returns `this` so the fluent chains in the service work unchanged, and the
 * object is thenable so `await` on a chain resolves to the staged rows.
 */
function fakeDb(staged: Row[] = []) {
	const calls: { op: string; values?: Row }[] = [];
	let rows = staged;

	const builder: any = {
		select() {
			calls.push({ op: 'select' });
			return builder;
		},
		insert() {
			calls.push({ op: 'insert' });
			return builder;
		},
		update() {
			calls.push({ op: 'update' });
			return builder;
		},
		delete() {
			calls.push({ op: 'delete' });
			return builder;
		},
		values(v: Row) {
			calls[calls.length - 1].values = v;
			return builder;
		},
		set(v: Row) {
			calls[calls.length - 1].values = v;
			return builder;
		},
		from() {
			return builder;
		},
		where() {
			return builder;
		},
		orderBy() {
			return builder;
		},
		limit() {
			return builder;
		},
		returning() {
			return Promise.resolve(rows);
		},
		then(resolve: (value: Row[]) => unknown) {
			return Promise.resolve(rows).then(resolve);
		}
	};

	return {
		db: builder,
		calls,
		stage(next: Row[]) {
			rows = next;
		}
	};
}

test('a newsletter signup records what was consented to', () => {
	const { db, calls } = fakeDb([]);
	const service = createInquiryService(db, { secretKey: SECRET });

	return service.subscribeToNewsletter({ email: 'Someone@Example.COM', source: 'footer-form' }).then(() => {
		const insert = calls.find((c) => c.op === 'insert');
		assert.ok(insert, 'expected an insert');

		const values = insert!.values as Row;
		assert.equal(values.email, 'someone@example.com', 'sanitized');
		assert.equal(values.consentSource, 'footer-form');
		assert.equal(values.consentText, NEWSLETTER_CONSENT_TEXT, 'wording stored verbatim');
		assert.ok(values.consentedAt instanceof Date, 'timestamped');
	});
});

test('the unsubscribe token is stored hashed, never in the clear', async () => {
	const { db, calls } = fakeDb([]);
	const service = createInquiryService(db, { secretKey: SECRET });

	const result = await service.subscribeToNewsletter({
		email: 'a@b.com',
		source: 'footer-form'
	});

	const values = calls.find((c) => c.op === 'insert')!.values as Row;

	assert.ok(result.unsubscribeToken.length > 0, 'a raw token is returned for the link');
	assert.notEqual(
		values.unsubscribeTokenHash,
		result.unsubscribeToken,
		'the stored value must not be the token itself'
	);
	assert.match(String(values.unsubscribeTokenHash), /^[0-9a-f]{64}$/, 'sha256 hex');
});

test('re-subscribing refreshes consent and rotates the token', async () => {
	const existing = { id: 1, email: 'a@b.com', unsubscribedAt: new Date('2026-01-01') };
	const { db, calls } = fakeDb([existing]);
	const service = createInquiryService(db, { secretKey: SECRET });

	const result = await service.subscribeToNewsletter({ email: 'a@b.com', source: 'footer-form' });

	const update = calls.find((c) => c.op === 'update');
	assert.ok(update, 'an existing record is updated rather than duplicated');

	const values = update!.values as Row;
	assert.equal(values.unsubscribedAt, null, 'no longer unsubscribed');
	assert.ok(values.consentedAt instanceof Date, 'consent re-dated — this is fresh consent');
	assert.equal(values.consentText, NEWSLETTER_CONSENT_TEXT);
	assert.equal(
		result.alreadySubscribed,
		false,
		'they had unsubscribed, so this counts as a new subscription'
	);
});

test('unsubscribing clears consent and stamps the time', async () => {
	const { db, calls } = fakeDb([{ id: 1 }]);
	const service = createInquiryService(db, { secretKey: SECRET });

	const result = await service.unsubscribeByToken('some-token');

	assert.equal(result.ok, true);
	const values = calls.find((c) => c.op === 'update')!.values as Row;
	assert.ok(values.unsubscribedAt instanceof Date);
	assert.equal(values.consentedAt, null, 'consent is withdrawn, not merely flagged');
});

test('an unknown unsubscribe token reports failure rather than silently succeeding', async () => {
	const { db } = fakeDb([]);
	const service = createInquiryService(db, { secretKey: SECRET });

	const result = await service.unsubscribeByToken('made-up');
	assert.equal(result.ok, false);
});

test('inquiry text is sanitized before it reaches the database', async () => {
	const { db, calls } = fakeDb([{ id: 1 }]);
	const service = createInquiryService(db, { secretKey: SECRET });

	await service.createGeneral({
		name: '<b>Tinashe</b>',
		email: '  TIN@Example.com ',
		message: '<script>alert(1)</script>hello'
	});

	const values = calls.find((c) => c.op === 'insert')!.values as Row;
	assert.equal(values.name, 'Tinashe');
	assert.equal(values.email, 'tin@example.com');
	assert.equal(values.message, 'alert(1)hello');
});
