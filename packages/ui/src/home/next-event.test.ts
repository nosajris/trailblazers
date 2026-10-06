import test from 'node:test';
import assert from 'node:assert/strict';
import { pickNextEvent, daysUntil } from './next-event.js';

const now = new Date('2026-10-06T10:00:00Z');
const ev = (id: number, date: string | Date) => ({ id, date });

test('returns the earliest event that has not started yet', () => {
	const picked = pickNextEvent([ev(1, '2026-11-14T09:00:00Z'), ev(2, '2026-10-10T09:00:00Z')], now);
	assert.equal(picked?.id, 2);
});

test('ignores events in the past', () => {
	const picked = pickNextEvent([ev(1, '2026-09-01T09:00:00Z'), ev(2, '2026-10-20T09:00:00Z')], now);
	assert.equal(picked?.id, 2);
});

test('returns null when nothing is upcoming or the list is empty', () => {
	assert.equal(pickNextEvent([], now), null);
	assert.equal(pickNextEvent([ev(1, '2026-01-01T00:00:00Z')], now), null);
});

test('skips events whose date cannot be parsed', () => {
	const picked = pickNextEvent([ev(1, 'not a date'), ev(2, new Date('2026-10-12T09:00:00Z'))], now);
	assert.equal(picked?.id, 2);
});

test('daysUntil counts whole calendar days and labels today/tomorrow', () => {
	assert.equal(daysUntil(new Date('2026-10-06T18:00:00Z'), now), 'Today');
	assert.equal(daysUntil(new Date('2026-10-07T08:00:00Z'), now), 'Tomorrow');
	assert.equal(daysUntil(new Date('2026-10-10T09:00:00Z'), now), 'In 4 days');
});
