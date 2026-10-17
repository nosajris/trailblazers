import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wrapLines } from './text-wrap.js';

test('short text fits on one line', () => {
	assert.deepEqual(wrapLines('Youth Camp', 20, 2), ['Youth Camp']);
});

test('wraps onto a second line at a word boundary', () => {
	assert.deepEqual(wrapLines('Annual Youth Camp Weekend', 15, 2), ['Annual Youth', 'Camp Weekend']);
});

test('truncates with an ellipsis when there are more words than lines can hold', () => {
	const lines = wrapLines('Annual Youth Camp 2026: Three Days of Worship and Community', 20, 2);
	assert.equal(lines.length, 2);
	assert.ok(lines[1].endsWith('…'));
});

test('empty input produces no lines', () => {
	assert.deepEqual(wrapLines('', 20, 2), []);
	assert.deepEqual(wrapLines('   ', 20, 2), []);
});

test('a single long word that exceeds the line width is kept whole rather than dropped', () => {
	const lines = wrapLines('Supercalifragilisticexpialidocious', 10, 2);
	assert.deepEqual(lines, ['Supercalifragilisticexpialidocious']);
});

test('text that fits exactly within the line budget is not marked truncated', () => {
	assert.deepEqual(wrapLines('One Two Three Four', 100, 2), ['One Two Three Four']);
});
