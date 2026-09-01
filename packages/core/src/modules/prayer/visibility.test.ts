/**
 * Prayer request visibility.
 *
 *   npm test
 *
 * These are the rules where a mistake publishes something a person shared in
 * confidence, so they are tested exhaustively rather than by example.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
	canShowPublicly,
	canStaffShare,
	toPublicPrayer,
	toPublicPrayerList
} from './visibility.js';

const base = {
	id: 1,
	fullName: 'Tinashe Moyo',
	request: 'Please pray for my mother.',
	isPrivate: true,
	isAnonymous: false,
	sharedPublicly: false
};

test('a request is private by default and is not shown', () => {
	assert.equal(canShowPublicly(base), false);
	assert.equal(toPublicPrayer(base), null);
});

test('consent alone does not publish', () => {
	// Not private, but no staff member has reviewed it.
	assert.equal(canShowPublicly({ ...base, isPrivate: false }), false);
});

test('a staff flag alone does not publish', () => {
	// The regression that matters most: staff must never be able to publish
	// something submitted in confidence by flipping one flag.
	assert.equal(canShowPublicly({ ...base, sharedPublicly: true }), false);
});

test('both consent and review are required', () => {
	assert.equal(canShowPublicly({ ...base, isPrivate: false, sharedPublicly: true }), true);
});

test('every combination behaves as intended', () => {
	const cases: [boolean, boolean, boolean][] = [
		// isPrivate, sharedPublicly, expected
		[true, true, false],
		[true, false, false],
		[false, true, true],
		[false, false, false]
	];

	for (const [isPrivate, sharedPublicly, expected] of cases) {
		assert.equal(
			canShowPublicly({ ...base, isPrivate, sharedPublicly }),
			expected,
			`isPrivate=${isPrivate} sharedPublicly=${sharedPublicly}`
		);
	}
});

test('a published request never carries contact details', () => {
	const vm = toPublicPrayer({ ...base, isPrivate: false, sharedPublicly: true });
	assert.deepEqual(Object.keys(vm!).sort(), ['id', 'name', 'request']);
});

test('an anonymous request is published without the name', () => {
	const vm = toPublicPrayer({
		...base,
		isPrivate: false,
		sharedPublicly: true,
		isAnonymous: true
	});
	assert.equal(vm?.name, 'Anonymous');
	assert.equal(vm?.request, base.request);
});

test('a missing name falls back to Anonymous rather than empty', () => {
	const vm = toPublicPrayer({
		...base,
		fullName: null,
		isPrivate: false,
		sharedPublicly: true
	});
	assert.equal(vm?.name, 'Anonymous');
});

test('a list drops everything not publishable', () => {
	const list = toPublicPrayerList([
		base,
		{ ...base, id: 2, isPrivate: false, sharedPublicly: true },
		{ ...base, id: 3, isPrivate: false },
		{ ...base, id: 4, sharedPublicly: true },
		{ ...base, id: 5, isPrivate: false, sharedPublicly: true, isAnonymous: true }
	]);

	assert.deepEqual(
		list.map((p) => p.id),
		[2, 5],
		'only the consented-and-reviewed entries survive'
	);
	assert.equal(list[1].name, 'Anonymous');
});

test('staff cannot promote a private request', () => {
	assert.equal(canStaffShare(base), false);
	assert.equal(canStaffShare({ ...base, isPrivate: false }), true);
});
