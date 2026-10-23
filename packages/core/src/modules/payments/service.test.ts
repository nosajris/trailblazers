/**
 * Service-layer tests with a fake database and fake providers — see
 * `modules/inquiries/service.test.ts` for the pattern this copies. The real
 * Paynow/Pesepay HTTP clients are swapped out via `providerOverrides` so
 * these exercise reference-minting, idempotent status moves and
 * config-error surfacing without a network call.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { createPaymentsService } from './service.ts';
import { PaymentConfigError } from './types.ts';
import type { PaymentProvider } from './types.ts';

type Row = Record<string, unknown>;

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
		values(v: Row) {
			calls[calls.length - 1].values = v;
			rows = [{ id: 1, status: 'PENDING', provider: v.provider, reference: v.reference, ...v }];
			return builder;
		},
		set(v: Row) {
			calls[calls.length - 1].values = v;
			if (rows[0]) rows = [{ ...rows[0], ...v }];
			return builder;
		},
		from() {
			return builder;
		},
		where() {
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

	return { db: builder, calls, stage: (next: Row[]) => (rows = next) };
}

const CONFIG = {
	paynow: { integrationId: undefined, integrationKey: undefined },
	pesepay: { integrationKey: undefined, encryptionKey: undefined },
	defaultProvider: 'PAYNOW' as const
};

function fakeProvider(overrides: Partial<PaymentProvider> = {}): PaymentProvider {
	return {
		name: 'PAYNOW',
		createPayment: async () => ({
			kind: 'redirect',
			redirectUrl: 'https://pay.example/x',
			providerReference: 'poll-1'
		}),
		checkStatus: async () => 'PENDING',
		parseResult: () => null,
		...overrides
	};
}

test('startPayment mints a reference and records the attempt before calling the provider', async () => {
	const { db, calls } = fakeDb();
	const service = createPaymentsService(db, CONFIG, { PAYNOW: fakeProvider() });

	const { reference, result } = await service.startPayment({
		purpose: 'GIVING',
		amount: 2500,
		description: 'A gift',
		payer: { name: 'Jane Doe', email: 'Jane@Example.com' },
		returnUrl: 'https://site/return',
		resultUrl: 'https://site/result'
	});

	assert.match(reference, /^GIVE-/);
	assert.equal(result.kind, 'redirect');

	const insert = calls.find((c) => c.op === 'insert');
	assert.ok(insert, 'the attempt is recorded');
	assert.equal(insert!.values!.payerEmail, 'jane@example.com', 'sanitized');
	assert.equal(insert!.values!.amount, 2500);
});

test('startPayment surfaces a config error rather than a generic failure', async () => {
	const { db } = fakeDb();
	const service = createPaymentsService(db, CONFIG, {
		PAYNOW: fakeProvider({
			createPayment: async () => {
				throw new PaymentConfigError('not configured');
			}
		})
	});

	await assert.rejects(
		() =>
			service.startPayment({
				purpose: 'GIVING',
				amount: 1000,
				description: 'A gift',
				payer: { name: 'A', email: 'a@b.com' },
				returnUrl: 'https://site/return',
				resultUrl: 'https://site/result'
			}),
		PaymentConfigError
	);
});

test('startPayment turns an ordinary provider failure into a generic, safe message', async () => {
	const { db } = fakeDb();
	const service = createPaymentsService(db, CONFIG, {
		PAYNOW: fakeProvider({
			createPayment: async () => {
				throw new Error('some internal gateway detail');
			}
		})
	});

	await assert.rejects(
		() =>
			service.startPayment({
				purpose: 'GIVING',
				amount: 1000,
				description: 'A gift',
				payer: { name: 'A', email: 'a@b.com' },
				returnUrl: 'https://site/return',
				resultUrl: 'https://site/result'
			}),
		/could not start that payment/
	);
});

test('handleCallback rejects a result that fails provider verification', async () => {
	const { db } = fakeDb();
	const service = createPaymentsService(db, CONFIG, {
		PAYNOW: fakeProvider({ parseResult: () => null })
	});

	const outcome = await service.handleCallback('PAYNOW', { bogus: '1' });
	assert.equal(outcome.ok, false);
});

test('handleCallback moves a pending payment to paid on a verified result', async () => {
	const { db, calls } = fakeDb([{ reference: 'GIVE-1', status: 'PENDING' }]);
	const service = createPaymentsService(db, CONFIG, {
		PAYNOW: fakeProvider({
			parseResult: () => ({
				reference: 'GIVE-1',
				providerReference: 'pn-1',
				status: 'PAID',
				raw: {}
			})
		})
	});

	const outcome = await service.handleCallback('PAYNOW', { reference: 'GIVE-1' });
	assert.equal(outcome.ok, true);
	assert.equal(outcome.changed, true);

	const update = calls.find((c) => c.op === 'update');
	assert.equal(update!.values!.status, 'PAID');
});

test('handleCallback is idempotent: a payment already decided does not change again', async () => {
	const { db, calls } = fakeDb([{ reference: 'GIVE-1', status: 'PAID' }]);
	const service = createPaymentsService(db, CONFIG, {
		PAYNOW: fakeProvider({
			parseResult: () => ({
				reference: 'GIVE-1',
				providerReference: 'pn-1',
				status: 'FAILED',
				raw: {}
			})
		})
	});

	const outcome = await service.handleCallback('PAYNOW', { reference: 'GIVE-1' });
	assert.equal(outcome.ok, true);
	assert.equal(outcome.changed, false);
	assert.equal(
		calls.some((c) => c.op === 'update'),
		false,
		'an already-decided payment is never re-written'
	);
});
