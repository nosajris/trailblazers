/**
 * CSV export tests.
 *
 *   node --experimental-strip-types --test packages/core/src/modules/export/service.test.ts
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { createExportService, escapeCsvValue, toCsvCell } from './service.js';

const csv = createExportService();

test('the injection this fixes: a formula cell is neutralised', () => {
	// Typed into the public contact form, exported by a staff member, executed
	// by their spreadsheet. Quoting alone did not stop it — the CSV parser
	// strips the quotes before the spreadsheet looks at the value.
	const attack = '=cmd|\' /c calc\'!A1';
	assert.equal(escapeCsvValue(attack), `'${attack}`);

	const output = csv.arrayToCsv([{ message: attack }]);
	assert.ok(output.includes(`"'=cmd`), `expected a leading apostrophe, got: ${output}`);
});

test('every formula trigger is covered', () => {
	for (const trigger of ['=', '+', '-', '@', '\t', '\r']) {
		const value = `${trigger}SUM(A1:A9)`;
		assert.equal(escapeCsvValue(value), `'${value}`, `trigger ${JSON.stringify(trigger)}`);
	}
});

test('ordinary text is left alone', () => {
	for (const value of ['Tinashe Moyo', 'hello@example.com', '2026-08-31', 'A - B']) {
		assert.equal(escapeCsvValue(value), value);
	}
});

test('a negative number is prefixed, since a spreadsheet cannot tell it from a formula', () => {
	// Accepted trade-off: correctness beats a tidy-looking minus sign.
	assert.equal(escapeCsvValue('-5'), "'-5");
});

test('empty and nullish values render as empty strings', () => {
	assert.equal(escapeCsvValue(null), '');
	assert.equal(escapeCsvValue(undefined), '');
	assert.equal(escapeCsvValue(''), '');
});

test('embedded quotes are doubled, so the row cannot be broken out of', () => {
	assert.equal(toCsvCell('She said "hello"'), '"She said ""hello"""');
});

test('a value containing a comma or newline stays inside its cell', () => {
	assert.equal(toCsvCell('Harare, Zimbabwe'), '"Harare, Zimbabwe"');
	assert.equal(toCsvCell('line one\nline two'), '"line one\nline two"');
});

test('headers are quoted too', () => {
	const output = csv.arrayToCsv([{ name: 'Test', email: 'a@b.com' }]);
	assert.equal(output.split('\n')[0], '"name","email"');
});

test('an empty dataset produces an empty string', () => {
	assert.equal(csv.arrayToCsv([]), '');
});

test('a full export keeps its shape', () => {
	const output = csv.arrayToCsv([
		{ id: 1, name: 'Tinashe', message: '=1+1' },
		{ id: 2, name: 'Chiedza', message: 'Hello there' }
	]);

	assert.deepEqual(output.split('\n'), [
		'"id","name","message"',
		'"1","Tinashe","\'=1+1"',
		'"2","Chiedza","Hello there"'
	]);
});
