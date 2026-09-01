/**
 * Locale resolution and translation lookup.
 *
 *   npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
	DEFAULT_LOCALE,
	createTranslator,
	isSupportedLocale,
	localeFromAcceptLanguage,
	resolveLocale,
	translationCoverage,
	type Locale,
	type Messages
} from './i18n.js';

const catalogues: Record<Locale, Messages> = {
	en: { greeting: 'Welcome', seats: '{count} seats left', onlyEnglish: 'English only' },
	sn: { greeting: 'Mauya' },
	nd: {}
};

test('supported locales are recognised', () => {
	assert.equal(isSupportedLocale('en'), true);
	assert.equal(isSupportedLocale('sn'), true);
	assert.equal(isSupportedLocale('nd'), true);
	assert.equal(isSupportedLocale('fr'), false);
});

test('Accept-Language picks the highest quality supported match', () => {
	assert.equal(localeFromAcceptLanguage('sn;q=0.9,en;q=0.8'), 'sn');
	assert.equal(localeFromAcceptLanguage('en-GB,en;q=0.9'), 'en');
});

test('a regional tag matches its base language', () => {
	// A Zimbabwean phone commonly sends sn-ZW rather than bare sn.
	assert.equal(localeFromAcceptLanguage('sn-ZW'), 'sn');
	assert.equal(localeFromAcceptLanguage('nd-ZW,en;q=0.5'), 'nd');
});

test('an unsupported or missing header falls back to English', () => {
	assert.equal(localeFromAcceptLanguage('fr-FR,de;q=0.8'), DEFAULT_LOCALE);
	assert.equal(localeFromAcceptLanguage(null), DEFAULT_LOCALE);
	assert.equal(localeFromAcceptLanguage(''), DEFAULT_LOCALE);
	assert.equal(localeFromAcceptLanguage('   '), DEFAULT_LOCALE);
});

test('an explicit choice beats the cookie and the browser', () => {
	assert.equal(
		resolveLocale({ query: 'nd', cookie: 'sn', acceptLanguage: 'en' }),
		'nd',
		'clicking a language link wins'
	);
});

test('a stored preference beats the browser', () => {
	assert.equal(resolveLocale({ query: null, cookie: 'sn', acceptLanguage: 'en' }), 'sn');
});

test('a junk query or cookie is ignored rather than trusted', () => {
	assert.equal(resolveLocale({ query: '../../etc/passwd', acceptLanguage: 'en' }), 'en');
	assert.equal(resolveLocale({ cookie: 'xx', acceptLanguage: 'sn' }), 'sn');
});

test('a translated key is used', () => {
	const t = createTranslator('sn', catalogues);
	assert.equal(t('greeting'), 'Mauya');
});

test('an untranslated key falls back to English, not to blank', () => {
	// This is the behaviour that lets an incomplete translation ship: the page
	// reads as English rather than showing holes.
	const t = createTranslator('sn', catalogues);
	assert.equal(t('onlyEnglish'), 'English only');
});

test('an entirely empty catalogue renders complete English', () => {
	const t = createTranslator('nd', catalogues);
	assert.equal(t('greeting'), 'Welcome');
	assert.equal(t('onlyEnglish'), 'English only');
});

test('a key missing everywhere returns the key so it is noticed', () => {
	const t = createTranslator('en', catalogues);
	assert.equal(t('does.not.exist'), 'does.not.exist');
});

test('placeholders are substituted', () => {
	const t = createTranslator('en', catalogues);
	assert.equal(t('seats', { count: 12 }), '12 seats left');
});

test('an unknown placeholder is left visible rather than blanked', () => {
	const t = createTranslator('en', catalogues);
	assert.equal(t('seats', { wrong: 1 }), '{count} seats left');
});

test('coverage reports translation progress', () => {
	assert.equal(translationCoverage(catalogues, 'en'), 1);
	assert.ok(Math.abs(translationCoverage(catalogues, 'sn') - 1 / 3) < 1e-9);
	assert.equal(translationCoverage(catalogues, 'nd'), 0);
});
