/**
 * Form validation tests.
 *
 *   npm test
 *
 * This file imports zod, so it cannot be run with bare type stripping in
 * isolation — `npm test` resolves it through node_modules as normal.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

import {
	checkbox,
	date,
	email,
	formDataToObject,
	id,
	oneOf,
	optionalId,
	optionalPhone,
	optionalText,
	optionalUrl,
	parseForm,
	requiredText,
	summarizeErrors
} from './form.ts';

function form(entries: Record<string, string | string[]>): FormData {
	const fd = new FormData();
	for (const [key, value] of Object.entries(entries)) {
		if (Array.isArray(value)) value.forEach((v) => fd.append(key, v));
		else fd.append(key, value);
	}
	return fd;
}

test('FormData becomes a plain object', () => {
	const result = formDataToObject(form({ name: 'Tinashe', email: 'a@b.com' }));
	assert.deepEqual(result, { name: 'Tinashe', email: 'a@b.com' });
});

test('repeated keys collapse into an array', () => {
	const result = formDataToObject(form({ team: ['worship', 'media'] }));
	assert.deepEqual(result, { team: ['worship', 'media'] });
});

test('a valid form parses to typed data', () => {
	const schema = z.object({ title: requiredText('Title'), attendees: id('Event') });
	const result = parseForm(form({ title: '  Camp 2026  ', attendees: '42' }), schema);

	assert.equal(result.success, true);
	if (result.success) {
		assert.equal(result.data.title, 'Camp 2026', 'trimmed');
		assert.equal(result.data.attendees, 42, 'coerced to a number');
	}
});

test('errors come back per field, not as a thrown exception', () => {
	const schema = z.object({ title: requiredText('Title'), email: email() });
	const result = parseForm(form({ title: '', email: 'not-an-email' }), schema);

	assert.equal(result.success, false);
	if (!result.success) {
		assert.equal(result.errors.title, 'Title is required');
		assert.match(result.errors.email, /valid email/i);
	}
});

test('sanitization happens in the validation layer', () => {
	// The rule says sanitize in the service layer; in practice it was applied in
	// one module out of twenty-two. Doing it here makes it automatic.
	const schema = z.object({ bio: requiredText('Bio'), email: email() });
	const result = parseForm(
		form({ bio: '<script>alert(1)</script>Hello', email: '  MiXeD@Example.COM ' }),
		schema
	);

	assert.equal(result.success, true);
	if (result.success) {
		assert.equal(result.data.bio, 'alert(1)Hello', 'tags stripped');
		assert.equal(result.data.email, 'mixed@example.com', 'lowercased and trimmed');
	}
});

test('optional text turns an empty string into undefined', () => {
	const schema = z.object({ notes: optionalText() });

	const empty = parseForm(form({ notes: '   ' }), schema);
	assert.equal(empty.success, true);
	if (empty.success) assert.equal(empty.data.notes, undefined);

	const filled = parseForm(form({ notes: 'Some notes' }), schema);
	if (filled.success) assert.equal(filled.data.notes, 'Some notes');
});

test('an unchecked checkbox reads as false, not missing', () => {
	// Browsers omit unchecked boxes entirely, which is why `form.get('x') === 'on'`
	// was scattered through the controllers.
	const schema = z.object({ isFeatured: checkbox() });

	const unchecked = parseForm(form({}), schema);
	assert.equal(unchecked.success, true);
	if (unchecked.success) assert.equal(unchecked.data.isFeatured, false);

	const checked = parseForm(form({ isFeatured: 'on' }), schema);
	if (checked.success) assert.equal(checked.data.isFeatured, true);
});

test('an optional id distinguishes create from update', () => {
	const schema = z.object({ id: optionalId() });

	const creating = parseForm(form({ id: '' }), schema);
	assert.equal(creating.success, true);
	if (creating.success) assert.equal(creating.data.id, undefined);

	const updating = parseForm(form({ id: '7' }), schema);
	if (updating.success) assert.equal(updating.data.id, 7);
});

test('a non-numeric id is rejected rather than becoming NaN', () => {
	const schema = z.object({ id: id() });
	const result = parseForm(form({ id: 'abc' }), schema);
	assert.equal(result.success, false);
});

test('a negative or zero id is rejected', () => {
	const schema = z.object({ id: id() });
	assert.equal(parseForm(form({ id: '0' }), schema).success, false);
	assert.equal(parseForm(form({ id: '-3' }), schema).success, false);
});

test('a value outside the allowed set is rejected', () => {
	const schema = z.object({ type: oneOf(['CAMP', 'WORKSHOP', 'MEETUP'], 'Type') });

	assert.equal(parseForm(form({ type: 'CAMP' }), schema).success, true);

	const bad = parseForm(form({ type: 'ADMIN_ONLY' }), schema);
	assert.equal(bad.success, false);
	if (!bad.success) assert.match(bad.errors.type, /valid type/i);
});

test('dates are coerced, and rubbish is rejected', () => {
	const schema = z.object({ when: date('Event date') });

	const good = parseForm(form({ when: '2026-09-15' }), schema);
	assert.equal(good.success, true);
	if (good.success) assert.equal(good.data.when.getUTCFullYear(), 2026);

	assert.equal(parseForm(form({ when: 'not a date' }), schema).success, false);
});

test('phone numbers keep their formatting but lose junk', () => {
	const schema = z.object({ phone: optionalPhone() });
	const result = parseForm(form({ phone: '+263 (77) 123-4567 <x>' }), schema);

	assert.equal(result.success, true);
	if (result.success) assert.equal(result.data.phone, '+263 (77) 123-4567 ');
});

test('an optional URL is validated when present', () => {
	const schema = z.object({ link: optionalUrl('Website') });

	assert.equal(parseForm(form({ link: '' }), schema).success, true);
	assert.equal(parseForm(form({ link: 'https://example.com' }), schema).success, true);
	assert.equal(parseForm(form({ link: 'http://example.com' }), schema).success, true);
	assert.equal(parseForm(form({ link: 'not a url' }), schema).success, false);
});

test('a javascript: or data: URL is rejected', () => {
	// zod's .url() accepts these on its own. They land in href and src
	// attributes, so accepting them would be a stored-XSS sink.
	const schema = z.object({ link: optionalUrl('Website') });

	for (const hostile of [
		'javascript:alert(1)',
		'JavaScript:alert(1)',
		'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
		'vbscript:msgbox(1)'
	]) {
		assert.equal(parseForm(form({ link: hostile }), schema).success, false, hostile);
	}
});

test('a too-long value is rejected rather than truncated in the database', () => {
	const schema = z.object({ title: requiredText('Title', 10) });
	const result = parseForm(form({ title: 'x'.repeat(11) }), schema);

	assert.equal(result.success, false);
	if (!result.success) assert.match(result.errors.title, /10 characters or fewer/);
});

test('unexpected extra fields are dropped, not passed through', () => {
	// Stops a hand-crafted POST smuggling a field the service would trust.
	const schema = z.object({ title: requiredText('Title') });
	const result = parseForm(form({ title: 'Fine', role: 'ADMIN' }), schema);

	assert.equal(result.success, true);
	if (result.success) assert.equal('role' in result.data, false);
});

test('summarizeErrors gives a form-level message', () => {
	assert.equal(summarizeErrors({ title: 'Title is required' }), 'Title is required');
	assert.match(summarizeErrors({}), /check the form/i);
});
