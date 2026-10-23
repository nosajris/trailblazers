import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createPaynowProvider } from './paynow.js';
import { PaymentConfigError } from '../types.js';

const INTEGRATION_KEY = 'test-integration-key';

function signLikePaynow(order: string[], fields: Record<string, string>, key: string): string {
	const concatenated = order.map((k) => fields[k] ?? '').join('') + key;
	return createHash('sha512').update(concatenated, 'utf8').digest('hex').toUpperCase();
}

test('createPaynowProvider throws a clear config error without credentials', async () => {
	const provider = createPaynowProvider({ integrationId: undefined, integrationKey: undefined });
	await assert.rejects(
		() =>
			provider.createPayment({
				reference: 'GIVE-1',
				amount: 1000,
				currency: 'USD',
				description: 'Test',
				payer: { name: 'A', email: 'a@example.org' },
				returnUrl: 'https://example.org/return',
				resultUrl: 'https://example.org/result'
			}),
		PaymentConfigError
	);
});

test('parseResult accepts a correctly-signed callback', () => {
	const provider = createPaynowProvider({ integrationId: '1', integrationKey: INTEGRATION_KEY });
	const order = ['reference', 'paynowreference', 'amount', 'status', 'pollurl'];
	const fields: Record<string, string> = {
		reference: 'GIVE-abc',
		paynowreference: '998877',
		amount: '10.00',
		status: 'Paid',
		pollurl: 'https://paynow.co.zw/interface/poll?guid=xyz'
	};
	fields.hash = signLikePaynow(order, fields, INTEGRATION_KEY);

	const result = provider.parseResult(fields);
	assert.ok(result);
	assert.equal(result?.reference, 'GIVE-abc');
	assert.equal(result?.status, 'PAID');
});

test('parseResult rejects a tampered callback', () => {
	const provider = createPaynowProvider({ integrationId: '1', integrationKey: INTEGRATION_KEY });
	const order = ['reference', 'paynowreference', 'amount', 'status', 'pollurl'];
	const fields: Record<string, string> = {
		reference: 'GIVE-abc',
		paynowreference: '998877',
		amount: '10.00',
		status: 'Paid',
		pollurl: 'https://paynow.co.zw/interface/poll?guid=xyz'
	};
	fields.hash = signLikePaynow(order, fields, INTEGRATION_KEY);

	// A forger bumps the amount after signing — the hash no longer matches.
	fields.amount = '10000.00';

	assert.equal(provider.parseResult(fields), null);
});

test('parseResult rejects a callback signed with the wrong key', () => {
	const provider = createPaynowProvider({ integrationId: '1', integrationKey: INTEGRATION_KEY });
	const order = ['reference', 'paynowreference', 'amount', 'status', 'pollurl'];
	const fields: Record<string, string> = {
		reference: 'GIVE-abc',
		paynowreference: '998877',
		amount: '10.00',
		status: 'Paid',
		pollurl: ''
	};
	fields.hash = signLikePaynow(order, fields, 'a-different-key');

	assert.equal(provider.parseResult(fields), null);
});
