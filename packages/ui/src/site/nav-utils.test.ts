import test from 'node:test';
import assert from 'node:assert/strict';
import { realLanguageOptions, isActivePath } from './nav-utils.js';

const en = { code: 'en', label: 'English', href: '#' };
const es = { code: 'es', label: 'Español', href: '#' };

test('placeholder "#" language links are not offered', () => {
	assert.deepEqual(realLanguageOptions([en, es]), []);
});

test('a switcher needs at least two options that really go somewhere', () => {
	assert.deepEqual(realLanguageOptions([{ ...en, href: '/en' }, es]), []);
	const both = [
		{ ...en, href: '/en' },
		{ ...es, href: '/es' }
	];
	assert.deepEqual(realLanguageOptions(both), both);
});

test('empty or missing hrefs count as not real; undefined input is safe', () => {
	assert.deepEqual(realLanguageOptions([{ code: 'en', label: 'English' }, { ...es, href: ' ' }]), []);
	assert.deepEqual(realLanguageOptions(undefined), []);
});

test('home is active only on "/"; sections are active on their sub-paths', () => {
	assert.equal(isActivePath('/', '/'), true);
	assert.equal(isActivePath('/events', '/'), false);
	assert.equal(isActivePath('/events', '/events'), true);
	assert.equal(isActivePath('/events/12', '/events'), true);
	assert.equal(isActivePath('/eventsfoo', '/events'), false);
});

test('external or empty hrefs are never active', () => {
	assert.equal(isActivePath('/give', 'https://pay.example.com'), false);
	assert.equal(isActivePath('/give', ''), false);
});
