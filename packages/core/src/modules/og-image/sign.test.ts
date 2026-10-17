import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ogImageUrl, signOgParams, verifyOgParams } from './sign.js';

test('the same params and secret always produce the same signature', () => {
	const a = signOgParams('secret', { title: 'Youth Camp', kicker: 'Event' });
	const b = signOgParams('secret', { title: 'Youth Camp', kicker: 'Event' });
	assert.equal(a, b);
});

test('a different title, kicker, or secret all change the signature', () => {
	const base = signOgParams('secret', { title: 'Youth Camp', kicker: 'Event' });
	assert.notEqual(signOgParams('secret', { title: 'Other', kicker: 'Event' }), base);
	assert.notEqual(signOgParams('secret', { title: 'Youth Camp', kicker: 'Sermon' }), base);
	assert.notEqual(signOgParams('different-secret', { title: 'Youth Camp', kicker: 'Event' }), base);
});

test('verifyOgParams accepts a signature signOgParams produced and rejects a tampered one', () => {
	const params = { title: 'Youth Camp', kicker: 'Event' };
	const sig = signOgParams('secret', params);
	assert.equal(verifyOgParams('secret', params, sig), true);
	assert.equal(verifyOgParams('secret', { ...params, title: 'Tampered' }, sig), false);
	assert.equal(verifyOgParams('secret', params, `${sig}x`), false);
	assert.equal(verifyOgParams('secret', params, ''), false);
});

test('ogImageUrl builds a /og URL carrying a signature that verifies', () => {
	const url = ogImageUrl('https://example.org', 'secret', { title: 'Youth Camp', kicker: 'Event' });
	const parsed = new URL(url);
	assert.equal(parsed.origin + parsed.pathname, 'https://example.org/og');
	const sig = parsed.searchParams.get('sig') ?? '';
	assert.equal(
		verifyOgParams('secret', { title: parsed.searchParams.get('title') ?? '', kicker: parsed.searchParams.get('kicker') ?? '' }, sig),
		true
	);
});
