import test from 'node:test';
import assert from 'node:assert/strict';
import {
	campusesToText,
	parseSocialLinks,
	socialLinksToText,
	telHref,
	givingMethodsToText,
	normalizeWhatsappNumber,
	parseCampuses,
	parseGivingMethods
} from './site-content.js';

test('an empty WhatsApp number clears the setting', () => {
	assert.deepEqual(normalizeWhatsappNumber(''), { number: null });
	assert.deepEqual(normalizeWhatsappNumber(undefined), { number: null });
	assert.deepEqual(normalizeWhatsappNumber('   '), { number: null });
});

test('a WhatsApp number keeps only its digits', () => {
	assert.deepEqual(normalizeWhatsappNumber('+263 77 123 4567'), { number: '263771234567' });
	assert.deepEqual(normalizeWhatsappNumber('263771234567'), { number: '263771234567' });
});

test('a local WhatsApp number is refused rather than guessed at', () => {
	const result = normalizeWhatsappNumber('0771234567');
	assert.equal(result.number, null);
	assert.match(result.error ?? '', /country code/);
});

test('a WhatsApp number of an impossible length is refused', () => {
	assert.match(normalizeWhatsappNumber('+1234').error ?? '', /8 to 15 digits/);
	assert.match(normalizeWhatsappNumber('+1234567890123456').error ?? '', /8 to 15 digits/);
	assert.match(normalizeWhatsappNumber('call us').error ?? '', /not a number/);
});

test('giving methods parse from one record per line', () => {
	const { items, error } = parseGivingMethods(
		'Bank transfer | CABS 1234567890, branch Harare | Reference: your name\nEcoCash | *151*2*1*123456#\n'
	);
	assert.equal(error, undefined);
	assert.deepEqual(items, [
		{ label: 'Bank transfer', detail: 'CABS 1234567890, branch Harare', note: 'Reference: your name' },
		{ label: 'EcoCash', detail: '*151*2*1*123456#' }
	]);
});

test('a giving method without a detail is refused', () => {
	assert.match(parseGivingMethods('Bank transfer').error ?? '', /needs a name and a detail/);
});

test('too many giving methods are refused', () => {
	const many = Array.from({ length: 7 }, (_, i) => `M${i} | d`).join('\n');
	assert.match(parseGivingMethods(many).error ?? '', /at most 6/);
});

test('campuses parse with times, address and map link', () => {
	const { items, error } = parseCampuses(
		'harare | Harare — Resurrection Center | Sundays 09:00; Sundays 11:00 | 1 Samora Machel Ave | https://maps.example.com/x'
	);
	assert.equal(error, undefined);
	assert.deepEqual(items, [
		{
			id: 'harare',
			label: 'Harare — Resurrection Center',
			href: '/campus/harare',
			times: ['Sundays 09:00', 'Sundays 11:00'],
			address: '1 Samora Machel Ave',
			mapUrl: 'https://maps.example.com/x'
		}
	]);
});

test('a campus needs only an id and a name', () => {
	const { items } = parseCampuses('gweru | Gweru — MSU Ignite');
	assert.deepEqual(items, [{ id: 'gweru', label: 'Gweru — MSU Ignite', href: '/campus/gweru' }]);
});

test('campus ids are slugs, unique, and lowercased', () => {
	assert.match(parseCampuses('Not A Slug | X').error ?? '', /letters, numbers and hyphens/);
	assert.match(parseCampuses('a | One\na | Two').error ?? '', /used twice/);
	assert.equal(parseCampuses('HARARE | H').items[0].id, 'harare');
});

test('a campus map link must be http(s)', () => {
	assert.match(
		parseCampuses('h | H | | | javascript:alert(1)').error ?? '',
		/not an http\(s\) address/
	);
});

test('parsed records render back into the text staff edit', () => {
	const text = 'harare | Harare | Sundays 09:00; Sundays 11:00 | 1 Samora Machel Ave | https://maps.example.com/x';
	assert.equal(campusesToText(parseCampuses(text).items), text);
	assert.equal(campusesToText(parseCampuses('gweru | Gweru').items), 'gweru | Gweru');
	assert.equal(givingMethodsToText(parseGivingMethods('EcoCash | *151#').items), 'EcoCash | *151#');
	assert.equal(campusesToText(undefined), '');
	assert.equal(givingMethodsToText(undefined), '');
});

test('social links parse and render round-trip', () => {
	const { items, error } = parseSocialLinks('Facebook | https://facebook.com/x\nYouTube | https://youtube.com/@x');
	assert.equal(error, undefined);
	assert.deepEqual(items, [
		{ label: 'Facebook', url: 'https://facebook.com/x' },
		{ label: 'YouTube', url: 'https://youtube.com/@x' }
	]);
	assert.equal(socialLinksToText(items), 'Facebook | https://facebook.com/x\nYouTube | https://youtube.com/@x');
	assert.equal(socialLinksToText(undefined), '');
});

test('a social link must have a name and an http(s) address', () => {
	assert.match(parseSocialLinks('Facebook').error ?? '', /needs a name and an address/);
	assert.match(parseSocialLinks('Facebook | javascript:alert(1)').error ?? '', /http\(s\) address/);
	assert.match(parseSocialLinks('A | https://a\nB | https://b\nC | https://c\nD | https://d\nE | https://e\nF | https://f\nG | https://g').error ?? '', /at most 6/);
});

test('a phone number keeps its display form but dials digits only', () => {
	assert.equal(telHref('+263 77 123 4567'), 'tel:+263771234567');
	assert.equal(telHref('0771 234 567'), 'tel:0771234567');
	assert.equal(telHref(''), undefined);
	assert.equal(telHref(undefined), undefined);
	assert.equal(telHref('call us'), undefined);
	assert.equal(telHref('12345'), undefined);
});
