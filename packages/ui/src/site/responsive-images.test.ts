import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { responsiveSrcset, RESPONSIVE_VARIANTS } from './responsive-images.js';

const images = (p: string) => fileURLToPath(new URL(`../../../../apps/web/static/images/${p}`, import.meta.url));

test('known photo gets webp variants plus the original', () => {
	const s = responsiveSrcset('/images/image01.jpeg');
	assert.ok(s?.includes('/images/w/image01-480.webp 480w'));
	assert.ok(s?.includes('/images/image01.jpeg '));
});
test('unknown, remote and empty sources get nothing', () => {
	assert.equal(responsiveSrcset('/images/nope.jpg'), undefined);
	assert.equal(responsiveSrcset('https://x.org/a.jpg'), undefined);
	assert.equal(responsiveSrcset(null), undefined);
	assert.equal(responsiveSrcset('/images/__proto__'), undefined);
});
test('every manifest entry points at files that exist', () => {
	for (const [file, [, widths]] of Object.entries(RESPONSIVE_VARIANTS)) {
		assert.ok(existsSync(images(file)), `${file} missing`);
		for (const w of widths) {
			const base = file.replace(/\.[^.]+$/, '');
			assert.ok(existsSync(images(`w/${base}-${w}.webp`)), `${base}-${w}.webp missing`);
		}
	}
});
