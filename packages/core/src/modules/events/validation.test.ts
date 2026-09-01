/**
 * Event input validation.
 *
 *   npm test
 *
 * These assert what the controller no longer has to: that bad input is refused
 * at the boundary rather than reaching Drizzle.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { parseForm } from '../../util/form.ts';
import { deleteEventSchema, saveEventSchema } from './validation.ts';

function form(entries: Record<string, string>): FormData {
	const fd = new FormData();
	for (const [key, value] of Object.entries(entries)) fd.append(key, value);
	return fd;
}

const VALID = {
	title: 'National Camp 2026',
	location: 'Harare',
	date: '2026-12-01',
	type: 'CAMP',
	status: 'PUBLISHED'
};

test('a complete event form parses', () => {
	const result = parseForm(form(VALID), saveEventSchema);
	assert.equal(result.success, true);

	if (result.success) {
		assert.equal(result.data.title, 'National Camp 2026');
		assert.equal(result.data.type, 'CAMP');
		assert.equal(result.data.isFeatured, false, 'unchecked box defaults to false');
		assert.equal(result.data.price, 0);
		assert.equal(result.data.capacity, 100);
		assert.equal(result.data.id, undefined, 'no id means create');
	}
});

test('the required fields are enforced', () => {
	for (const missing of ['title', 'location', 'date']) {
		const entries = { ...VALID };
		delete (entries as Record<string, string>)[missing];

		const result = parseForm(form(entries), saveEventSchema);
		assert.equal(result.success, false, `${missing} should be required`);
	}
});

test('an unknown event type is refused', () => {
	const result = parseForm(form({ ...VALID, type: 'CONFERENCE' }), saveEventSchema);
	assert.equal(result.success, false);
	if (!result.success) assert.match(result.errors.type, /valid event type/i);
});

test('a negative price is refused rather than stored', () => {
	const result = parseForm(form({ ...VALID, price: '-100' }), saveEventSchema);
	assert.equal(result.success, false);
	if (!result.success) assert.match(result.errors.price, /negative/i);
});

test('a zero or negative capacity is refused', () => {
	assert.equal(parseForm(form({ ...VALID, capacity: '0' }), saveEventSchema).success, false);
	assert.equal(parseForm(form({ ...VALID, capacity: '-5' }), saveEventSchema).success, false);
});

test('a hostile image URL is refused', () => {
	// This value goes into an <img src>, so the scheme check matters.
	const result = parseForm(
		form({ ...VALID, imageUrl: 'javascript:alert(document.cookie)' }),
		saveEventSchema
	);
	assert.equal(result.success, false);
});

test('event titles are sanitized', () => {
	const result = parseForm(
		form({ ...VALID, title: '<script>alert(1)</script>Camp' }),
		saveEventSchema
	);
	assert.equal(result.success, true);
	if (result.success) assert.equal(result.data.title, 'alert(1)Camp');
});

test('an id turns the same form into an update', () => {
	const result = parseForm(form({ ...VALID, id: '12' }), saveEventSchema);
	assert.equal(result.success, true);
	if (result.success) assert.equal(result.data.id, 12);
});

test('a garbage date is refused instead of becoming Invalid Date', () => {
	const result = parseForm(form({ ...VALID, date: 'next tuesday-ish' }), saveEventSchema);
	assert.equal(result.success, false);
});

test('deleting requires a real id', () => {
	assert.equal(parseForm(form({ id: '5' }), deleteEventSchema).success, true);
	assert.equal(parseForm(form({ id: '' }), deleteEventSchema).success, false);
	assert.equal(parseForm(form({ id: 'abc' }), deleteEventSchema).success, false);
	assert.equal(parseForm(form({}), deleteEventSchema).success, false);
});
