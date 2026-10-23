import test from 'node:test';
import assert from 'node:assert/strict';
import {
	MAX_FORM_FIELDS,
	composeInquiry,
	formFieldsProblem,
	parseFormFields,
	validateSubmission
} from './form-fields.js';

test('a field is a label, a kind and whether it is required', () => {
	const fields = parseFormFields('Your name | text | required\nPhone | phone');

	assert.deepEqual(fields, [
		{ name: 'your-name', label: 'Your name', kind: 'text', required: true, options: [] },
		{ name: 'phone', label: 'Phone', kind: 'phone', required: false, options: [] }
	]);
});

test('the kind may be left off, and defaults to a single line of text', () => {
	assert.deepEqual(parseFormFields('Your name')[0], {
		name: 'your-name',
		label: 'Your name',
		kind: 'text',
		required: false,
		options: []
	});
});

test('a choice field carries its options', () => {
	const [field] = parseFormFields('Which service? | choice: 7am, 9am, 11am | required');

	assert.equal(field.kind, 'choice');
	assert.equal(field.required, true);
	assert.deepEqual(field.options, ['7am', '9am', '11am']);
});

test('a choice with no options is not a choice, because it would render an empty menu', () => {
	assert.equal(parseFormFields('Which service? | choice:')[0].kind, 'text');
	assert.equal(parseFormFields('Which service? | choice')[0].kind, 'text');
});

test('blank lines, comments and stray separators are ignored', () => {
	const fields = parseFormFields(`
		# The visitor's details
		Your name | text

		Email | email
		|
	`);

	assert.deepEqual(
		fields.map((f) => f.name),
		['your-name', 'email']
	);
});

test('an unknown kind falls back to text rather than dropping the field', () => {
	// Losing a question silently would be worse than rendering it as a text box.
	const [field] = parseFormFields('How did you hear about us? | dropdown');
	assert.equal(field.kind, 'text');
	assert.equal(field.label, 'How did you hear about us?');
});

test('two fields that would share a name are kept apart', () => {
	// Both would otherwise be `name`, and the second would overwrite the first
	// in the submitted form data.
	const fields = parseFormFields('Name | text\nName | text\nName | text');
	assert.deepEqual(
		fields.map((f) => f.name),
		['name', 'name-2', 'name-3']
	);
});

test('a label of only punctuation still gets a usable field name', () => {
	const [field] = parseFormFields('??? | text');
	assert.ok(field.name.length > 0);
	assert.match(field.name, /^[a-z0-9-]+$/);
});

test('the number of fields is capped', () => {
	const many = Array.from({ length: MAX_FORM_FIELDS + 5 }, (_, i) => `Question ${i} | text`).join('\n');
	assert.equal(parseFormFields(many).length, MAX_FORM_FIELDS);
});

test('a form must collect an email address, because that is how staff reply', () => {
	assert.match(formFieldsProblem(parseFormFields('Your name | text')) ?? '', /email/i);
	assert.equal(formFieldsProblem(parseFormFields('Your name | text\nEmail | email')), null);
});

test('a form with no fields at all is refused', () => {
	assert.match(formFieldsProblem(parseFormFields('')) ?? '', /at least one/i);
});

test('a required field left blank is reported against that field', () => {
	const fields = parseFormFields('Your name | text | required\nEmail | email | required\nPhone | phone');
	const result = validateSubmission(fields, { 'your-name': '', email: 'me@example.org', phone: '' });

	assert.equal(result.ok, false);
	if (result.ok) return;
	assert.equal(result.errors['your-name'], 'Your name is required.');
	// An optional field left blank is not an error.
	assert.equal(result.errors.phone, undefined);
});

test('an address that is not an address is reported', () => {
	const fields = parseFormFields('Email | email | required');
	const result = validateSubmission(fields, { email: 'not-an-address' });
	assert.equal(result.ok, false);
});

test('a choice answer must be one of the offered options', () => {
	// Otherwise anything at all could be posted into a field that renders as a
	// closed list of three options.
	const fields = parseFormFields('Which service? | choice: 7am, 9am | required');

	assert.equal(validateSubmission(fields, { 'which-service': '9am' }).ok, true);
	assert.equal(validateSubmission(fields, { 'which-service': 'midnight' }).ok, false);
});

test('an answer longer than the field allows is refused', () => {
	const fields = parseFormFields('Your name | text | required');
	assert.equal(validateSubmission(fields, { 'your-name': 'x'.repeat(5000) }).ok, false);
});

test('a submission becomes an inquiry staff can read and reply to', () => {
	const fields = parseFormFields(
		'Your name | text | required\nEmail | email | required\nWhich service? | choice: 7am, 9am\nAnything else | long'
	);

	const inquiry = composeInquiry('Plan your visit', fields, {
		'your-name': 'Tendai Moyo',
		email: 'tendai@example.org',
		'which-service': '9am',
		'anything-else': 'Bringing two friends.'
	});

	assert.equal(inquiry.name, 'Tendai Moyo');
	assert.equal(inquiry.email, 'tendai@example.org');
	// Every answer appears under its own question, so a form staff designed
	// themselves is readable without a key.
	assert.match(inquiry.message, /Plan your visit/);
	assert.match(inquiry.message, /Which service\?: 9am/);
	assert.match(inquiry.message, /Anything else: Bringing two friends\./);
});

test('an unanswered optional question is left out of the message, not shown blank', () => {
	const fields = parseFormFields('Email | email | required\nPhone | phone');
	const inquiry = composeInquiry('Contact', fields, { email: 'a@b.org', phone: '' });
	assert.doesNotMatch(inquiry.message, /Phone/);
});

test('a form with no name field still files under something staff can read', () => {
	const fields = parseFormFields('Email | email | required');
	const inquiry = composeInquiry('Newsletter', fields, { email: 'a@b.org' });
	assert.ok(inquiry.name.length > 0);
});
