import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whatsappShareUrl } from './share.js';

test('encodes text for wa.me', () => {
	assert.equal(whatsappShareUrl('Camp & Fun https://x.org/a?b=1'), 'https://wa.me/?text=Camp%20%26%20Fun%20https%3A%2F%2Fx.org%2Fa%3Fb%3D1');
});
test('trims whitespace', () => {
	assert.equal(whatsappShareUrl('  hi \n'), 'https://wa.me/?text=hi');
});
