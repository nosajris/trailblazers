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
test('a CMS upload derives its srcset from its own file name, no lookup needed', () => {
	const s = responsiveSrcset('https://abc123.public.blob.vercel-storage.com/cms/f1b2-1600.webp');
	assert.equal(
		s,
		'https://abc123.public.blob.vercel-storage.com/cms/f1b2-480.webp 480w, ' +
			'https://abc123.public.blob.vercel-storage.com/cms/f1b2-960.webp 960w, ' +
			'https://abc123.public.blob.vercel-storage.com/cms/f1b2-1600.webp 1600w'
	);
});
test("a CMS upload narrower than a breakpoint doesn't reference a variant that was never generated", () => {
	const s = responsiveSrcset('https://abc123.public.blob.vercel-storage.com/cms/f1b2-700.webp');
	assert.equal(
		s,
		'https://abc123.public.blob.vercel-storage.com/cms/f1b2-480.webp 480w, ' +
			'https://abc123.public.blob.vercel-storage.com/cms/f1b2-700.webp 700w'
	);
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
