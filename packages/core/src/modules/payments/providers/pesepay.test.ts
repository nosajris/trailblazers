import test from 'node:test';
import assert from 'node:assert/strict';
import { createPesepayProvider, encrypt, decrypt } from './pesepay.js';
import { PaymentConfigError } from '../types.js';

// Pesepay's encryption key is 32 bytes; this is a fixture, not a real secret.
const ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef'.slice(0, 32);

test('encrypt/decrypt round-trips arbitrary JSON', () => {
	const plaintext = JSON.stringify({ hello: 'world', amount: 12.5, nested: { a: 1 } });
	const ciphertext = encrypt(plaintext, ENCRYPTION_KEY);
	assert.notEqual(ciphertext, plaintext);
	assert.equal(decrypt(ciphertext, ENCRYPTION_KEY), plaintext);
});

test('decrypt fails on ciphertext encrypted with a different key', () => {
	const ciphertext = encrypt('{"ok":true}', ENCRYPTION_KEY);
	const otherKey = 'ffffffffffffffffffffffffffffffff'.slice(0, 32);
	assert.throws(() => decrypt(ciphertext, otherKey));
});

test('createPesepayProvider throws a clear config error without credentials', async () => {
	const provider = createPesepayProvider({ integrationKey: undefined, encryptionKey: undefined });
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

test('createPesepayProvider rejects a malformed encryption key', () => {
	assert.throws(
		() =>
			createPesepayProvider({ integrationKey: 'k', encryptionKey: 'too-short' }).parseResult({}),
		PaymentConfigError
	);
});

test('parseResult decodes a correctly-encrypted callback', () => {
	const provider = createPesepayProvider({ integrationKey: 'k', encryptionKey: ENCRYPTION_KEY });
	const decrypted = {
		merchantReference: 'GIVE-abc',
		referenceNumber: 'PSP-998877',
		transactionStatus: 'SUCCESS'
	};
	const payload = encrypt(JSON.stringify(decrypted), ENCRYPTION_KEY);

	const result = provider.parseResult({ payload });
	assert.ok(result);
	assert.equal(result?.reference, 'GIVE-abc');
	assert.equal(result?.status, 'PAID');
});

test('parseResult rejects ciphertext that cannot be decrypted with our key', () => {
	const provider = createPesepayProvider({ integrationKey: 'k', encryptionKey: ENCRYPTION_KEY });
	const result = provider.parseResult({
		payload: Buffer.from('not valid ciphertext').toString('base64')
	});
	assert.equal(result, null);
});

test('parseResult rejects a payload missing a merchant reference', () => {
	const provider = createPesepayProvider({ integrationKey: 'k', encryptionKey: ENCRYPTION_KEY });
	const payload = encrypt(JSON.stringify({ transactionStatus: 'SUCCESS' }), ENCRYPTION_KEY);
	assert.equal(provider.parseResult({ payload }), null);
});
