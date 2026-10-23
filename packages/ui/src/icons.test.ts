import test from 'node:test';
import assert from 'node:assert/strict';
// The explicit `.ts` is what lets Node's test runner resolve across the
// workspace: the package's `./*` export maps to `./src/*`, which has no
// extension for Node to infer. The apps' vite alias resolves the extensionless
// form, so components keep writing it without.
import { BLOCKS, PAGE_SECTION_TYPES } from '@trailblazers/core/modules/pages/block-registry.ts';
import { ICONS, ICON_NAMES, hasIcon, searchIcons } from './icons.js';

test('every icon a block declares exists in the set', () => {
	// The registry names an icon; this file draws it. Nothing else connects the
	// two, so a renamed or removed icon would quietly fall back to a question
	// mark in the staff editor without this.
	for (const type of PAGE_SECTION_TYPES) {
		assert.ok(
			hasIcon(BLOCKS[type].icon),
			`${type} declares the unknown icon "${BLOCKS[type].icon}"`
		);
	}
});

test('every icon draws at least one path and is findable', () => {
	for (const name of ICON_NAMES) {
		const icon = ICONS[name];
		assert.ok(icon.paths.length > 0, name);
		for (const path of icon.paths) {
			assert.match(path, /^[Mm]/, `${name} has a path that does not start with a move command`);
		}
		// An icon nobody can find is an icon nobody will use.
		assert.ok(icon.keywords.length > 0, name);
		assert.ok(searchIcons(name).includes(name), name);
	}
});

test('`help` exists, because it is what an unknown name falls back to', () => {
	assert.ok(hasIcon('help'));
});

test('search finds an icon by what staff would call it', () => {
	// Not by its name: "phone" is the word people use for `call`.
	assert.ok(searchIcons('phone').includes('call'));
	assert.ok(searchIcons('tithe').includes('gift'));
	assert.ok(searchIcons('whatsapp').includes('message'));
	assert.ok(searchIcons('kids').includes('baby'));
});

test('search puts the closest match first', () => {
	assert.equal(searchIcons('calendar')[0], 'calendar');
	assert.equal(searchIcons('cal')[0], 'calendar');
	// An exact name beats another icon that merely lists it as a keyword.
	assert.equal(searchIcons('check')[0], 'check');
});

test('a blank search shows the whole set, and nonsense shows none', () => {
	assert.deepEqual(searchIcons(''), ICON_NAMES);
	assert.deepEqual(searchIcons('   '), ICON_NAMES);
	assert.deepEqual(searchIcons('zzzzz'), []);
});
