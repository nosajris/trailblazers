/**
 * Registration rules.
 *
 *   npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
	isFull,
	isRegistrationOpen,
	nextInLine,
	nextRegistrationStatus,
	seatsRemaining
} from './registration.js';

test('a seat is given while capacity remains', () => {
	assert.equal(nextRegistrationStatus({ capacity: 100, confirmed: 0 }), 'CONFIRMED');
	assert.equal(nextRegistrationStatus({ capacity: 100, confirmed: 99 }), 'CONFIRMED');
});

test('the person who fills the last seat still gets it', () => {
	// Off-by-one guard: with 99 confirmed of 100, the next registration is the
	// hundredth and must be confirmed, not waitlisted.
	assert.equal(seatsRemaining({ capacity: 100, confirmed: 99 }), 1);
	assert.equal(nextRegistrationStatus({ capacity: 100, confirmed: 99 }), 'CONFIRMED');
});

test('registrations past capacity go to the waitlist', () => {
	assert.equal(nextRegistrationStatus({ capacity: 100, confirmed: 100 }), 'WAITLIST');
	assert.equal(nextRegistrationStatus({ capacity: 100, confirmed: 150 }), 'WAITLIST');
	assert.equal(isFull({ capacity: 100, confirmed: 100 }), true);
});

test('an event with no capacity set is unlimited, not full', () => {
	// Every existing event has capacity unset or default; treating null as zero
	// would waitlist the entire church.
	assert.equal(nextRegistrationStatus({ capacity: null, confirmed: 5000 }), 'CONFIRMED');
	assert.equal(nextRegistrationStatus({ capacity: 0, confirmed: 5000 }), 'CONFIRMED');
	assert.equal(isFull({ capacity: null, confirmed: 5000 }), false);
	assert.equal(seatsRemaining({ capacity: null, confirmed: 5000 }), null);
});

test('seats remaining never goes negative', () => {
	// Capacity can be lowered after people have registered.
	assert.equal(seatsRemaining({ capacity: 10, confirmed: 25 }), 0);
});

test('registration closes once the event has started', () => {
	const now = new Date('2026-09-01T12:00:00Z');
	assert.equal(isRegistrationOpen(new Date('2026-09-02T09:00:00Z'), now), true);
	assert.equal(isRegistrationOpen(new Date('2026-09-01T11:59:00Z'), now), false);
});

test('the waitlist is promoted oldest first', () => {
	const registrations = [
		{ status: 'CONFIRMED' as const, createdAt: new Date('2026-01-01'), who: 'confirmed' },
		{ status: 'WAITLIST' as const, createdAt: new Date('2026-03-01'), who: 'later' },
		{ status: 'WAITLIST' as const, createdAt: new Date('2026-02-01'), who: 'earlier' }
	];

	assert.equal(nextInLine(registrations)?.who, 'earlier');
});

test('nothing is promoted when nobody is waiting', () => {
	assert.equal(
		nextInLine([{ status: 'CONFIRMED' as const, createdAt: new Date(), who: 'a' }]),
		null
	);
	assert.equal(nextInLine([]), null);
});

test('a cancelled registration is never promoted', () => {
	const registrations = [
		{ status: 'CANCELLED' as const, createdAt: new Date('2026-01-01'), who: 'gone' },
		{ status: 'WAITLIST' as const, createdAt: new Date('2026-02-01'), who: 'waiting' }
	];

	assert.equal(nextInLine(registrations)?.who, 'waiting');
});
