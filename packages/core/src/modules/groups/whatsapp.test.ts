import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseWhatsappLink } from './whatsapp.js';

test('empty clears the link', () => {
	assert.deepEqual(parseWhatsappLink(''), { ok: true, url: null });
	assert.deepEqual(parseWhatsappLink('   '), { ok: true, url: null });
	assert.deepEqual(parseWhatsappLink(undefined), { ok: true, url: null });
});
test('accepts WhatsApp invite and wa.me links', () => {
	assert.deepEqual(parseWhatsappLink(' https://chat.whatsapp.com/AbC123 '), { ok: true, url: 'https://chat.whatsapp.com/AbC123' });
	assert.equal(parseWhatsappLink('https://wa.me/263771234567').ok, true);
});
test('rejects other hosts, schemes, lookalikes and credentials', () => {
	for (const bad of [
		'http://chat.whatsapp.com/x',
		'https://evil.com/chat.whatsapp.com',
		'https://chat.whatsapp.com.evil.com/x',
		'javascript:alert(1)',
		'https://user:pw@wa.me/1',
		'chat.whatsapp.com/x',
		'+263771234567'
	]) {
		assert.deepEqual(parseWhatsappLink(bad), { ok: false }, bad);
	}
});
