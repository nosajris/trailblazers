import test from 'node:test';
import assert from 'node:assert/strict';
import { clampToLongEdge, variantWidthsFor, MAX_LONG_EDGE, VARIANT_WIDTHS } from './dimensions.js';

test('an image already within bounds is left alone', () => {
	const result = clampToLongEdge(1200, 800);
	assert.deepEqual(result, { width: 1200, height: 800, resize: false });
});

test('a landscape photo wider than the cap is scaled down, aspect preserved', () => {
	const result = clampToLongEdge(3200, 1600, 1600);
	assert.deepEqual(result, { width: 1600, height: 800, resize: true });
});

test('a portrait photo is capped on its tall edge, not its narrow one', () => {
	const result = clampToLongEdge(1200, 4000, 1600);
	assert.equal(result.height, 1600);
	assert.equal(result.resize, true);
	assert.equal(result.width, Math.round(1200 * (1600 / 4000)));
});

test('a square at exactly the cap is left alone', () => {
	const result = clampToLongEdge(MAX_LONG_EDGE, MAX_LONG_EDGE);
	assert.equal(result.resize, false);
});

test('zero-size input never divides by zero or resizes', () => {
	assert.deepEqual(clampToLongEdge(0, 0), { width: 0, height: 0, resize: false });
});

test('only variant widths strictly smaller than the full width are generated', () => {
	assert.deepEqual(variantWidthsFor(1600), [...VARIANT_WIDTHS]);
	assert.deepEqual(variantWidthsFor(960), [480]);
	assert.deepEqual(variantWidthsFor(400), []);
});
