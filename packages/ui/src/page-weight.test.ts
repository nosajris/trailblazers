import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Guards the image/video optimisation: a new heavy upload fails here, not on a phone. */
const dir = fileURLToPath(new URL('../../../apps/web/static/images/', import.meta.url));
const KB = 1024;
const MB = 1024 * KB;
const MAX_IMAGE = 650 * KB;
const MAX_VIDEO = 10 * MB;
// Today's total is about 30.4 MB, of which the two background videos are 17.5 MB. Lower this as media shrinks; do not raise it.
const MAX_TOTAL = 32 * MB;

const list = (d: string) =>
	readdirSync(d)
		.map((name) => ({ name, size: statSync(join(d, name)).size, isDir: statSync(join(d, name)).isDirectory() }))
		.flatMap((f) => (f.isDir ? list(join(d, f.name)) : [{ name: f.name, size: f.size }]));
const files = list(dir);

test('no single image is heavy', () => {
	const heavy = files.filter((f) => /\.(jpe?g|png|webp)$/i.test(f.name) && f.size > MAX_IMAGE);
	assert.deepEqual(heavy, []);
});
test('no single video is heavy', () => {
	const heavy = files.filter((f) => extname(f.name).toLowerCase() === '.mp4' && f.size > MAX_VIDEO);
	assert.deepEqual(heavy, []);
});
test('total static media stays bounded', () => {
	const total = files.reduce((n, f) => n + f.size, 0);
	assert.ok(total <= MAX_TOTAL, `total ${(total / MB).toFixed(1)}MB exceeds ${MAX_TOTAL / MB}MB`);
});
