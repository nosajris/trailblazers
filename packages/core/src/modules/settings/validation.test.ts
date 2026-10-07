import test from 'node:test';
import assert from 'node:assert/strict';
import { campusesSchema, contactChannelsSchema, givingDetailsSchema, visitDetailsSchema, MAX_VISIT_TIMES } from './validation.js';

test('an empty form is valid and produces no details', () => {
	const r = visitDetailsSchema.parse({});
	assert.deepEqual(r.visitTimes, []);
	assert.equal(r.visitAddress, undefined);
	assert.equal(r.visitMapUrl, undefined);
});

test('gathering times: one per line, blanks dropped, tags stripped', () => {
	const r = visitDetailsSchema.parse({ visitTimes: 'Sunday 09:00\r\n\r\n  Wed 18:00 <b>Prayer</b>\n' });
	assert.deepEqual(r.visitTimes, ['Sunday 09:00', 'Wed 18:00 Prayer']);
});

test('too many gathering times is rejected', () => {
	const many = Array.from({ length: MAX_VISIT_TIMES + 1 }, (_, i) => `Time ${i}`).join('\n');
	assert.equal(visitDetailsSchema.safeParse({ visitTimes: many }).success, false);
});

test('a map link must be http(s): javascript: and data: are rejected', () => {
	for (const bad of ['javascript:alert(1)', 'data:text/html,hi', 'not a url']) {
		assert.equal(visitDetailsSchema.safeParse({ visitMapUrl: bad }).success, false, bad);
	}
	const ok = visitDetailsSchema.parse({ visitMapUrl: ' https://maps.example.com/p/1 ' });
	assert.equal(ok.visitMapUrl, 'https://maps.example.com/p/1');
});

test('address and notes are trimmed and tag-stripped; blank becomes undefined', () => {
	const r = visitDetailsSchema.parse({ visitAddress: '  12 Samora Machel <script>x</script> ', visitNotes: '   ' });
	assert.equal(r.visitAddress, '12 Samora Machel x');
	assert.equal(r.visitNotes, undefined);
});

test('contact channels store the WhatsApp number as digits', () => {
	const ok = contactChannelsSchema.safeParse({ whatsappNumber: '+263 77 123 4567', whatsappGreeting: 'Hi!' });
	assert.equal(ok.success, true);
	if (ok.success) assert.deepEqual(ok.data, { whatsappNumber: '263771234567', whatsappGreeting: 'Hi!' });
});

test('an unusable WhatsApp number fails validation with advice', () => {
	const bad = contactChannelsSchema.safeParse({ whatsappNumber: '0771234567' });
	assert.equal(bad.success, false);
	if (!bad.success) assert.match(bad.error.issues[0].message, /country code/);
});

test('an empty WhatsApp number leaves the setting unset', () => {
	const empty = contactChannelsSchema.safeParse({ whatsappNumber: '' });
	assert.equal(empty.success, true);
	if (empty.success) assert.equal(empty.data.whatsappNumber, undefined);
});

test('giving methods and campuses arrive as structured lists', () => {
	const giving = givingDetailsSchema.safeParse({ givingMethods: 'EcoCash | *151#', givingNote: 'Thank you' });
	assert.equal(giving.success, true);
	if (giving.success) assert.deepEqual(giving.data.givingMethods, [{ label: 'EcoCash', detail: '*151#' }]);

	const campuses = campusesSchema.safeParse({ campuses: 'harare | Harare | Sundays 09:00' });
	assert.equal(campuses.success, true);
	if (campuses.success) {
		assert.deepEqual(campuses.data.campuses, [
			{ id: 'harare', label: 'Harare', href: '/campus/harare', times: ['Sundays 09:00'] }
		]);
	}
});

test('a malformed list is reported as a field error, not silently dropped', () => {
	const bad = givingDetailsSchema.safeParse({ givingMethods: 'Bank transfer' });
	assert.equal(bad.success, false);
	if (!bad.success) assert.equal(bad.error.issues[0].path[0], 'givingMethods');
});
