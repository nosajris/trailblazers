import test from 'node:test';
import assert from 'node:assert/strict';
import { visitDetailsSchema, MAX_VISIT_TIMES } from './validation.js';

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
