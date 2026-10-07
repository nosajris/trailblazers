import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eventReminderText, whatsappChatUrl, whatsappShareUrl } from './share.js';

test('encodes text for wa.me', () => {
	assert.equal(whatsappShareUrl('Camp & Fun https://x.org/a?b=1'), 'https://wa.me/?text=Camp%20%26%20Fun%20https%3A%2F%2Fx.org%2Fa%3Fb%3D1');
});
test('trims whitespace', () => {
	assert.equal(whatsappShareUrl('  hi \n'), 'https://wa.me/?text=hi');
});

test('a chat link carries the number and the prefilled text', () => {
	assert.equal(whatsappChatUrl('263771234567'), 'https://wa.me/263771234567');
	assert.equal(
		whatsappChatUrl('+263 77 123 4567', 'Hi, I am new'),
		'https://wa.me/263771234567?text=Hi%2C%20I%20am%20new'
	);
});

test('an unusable number produces no chat link', () => {
	for (const bad of ['', '   ', undefined, null, '12345', '1234567890123456', 'call me']) {
		assert.equal(whatsappChatUrl(bad as string | null | undefined), undefined, String(bad));
	}
});

test('a reminder names the event, when and where, then the link', () => {
	assert.equal(
		eventReminderText({ title: 'Camp', when: 'Sat 12 Jul, 09:00', where: 'MSU' }, 'https://x.org/e/1'),
		'Reminder: Camp — Sat 12 Jul, 09:00 at MSU\nhttps://x.org/e/1'
	);
	assert.equal(
		eventReminderText({ title: 'Camp', when: 'Sat' }, 'https://x.org/e/1'),
		'Reminder: Camp — Sat\nhttps://x.org/e/1'
	);
});
