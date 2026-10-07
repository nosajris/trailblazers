import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_EVENTS_RAIL_LIMIT, pageSchema, pageSectionSchema, toSectionConfig } from './validation.js';
import { isPageSectionType, PAGE_SECTION_TYPES, SECTION_TYPE_INFO } from './section-types.js';

test('every section type has editor metadata', () => {
	for (const type of PAGE_SECTION_TYPES) {
		assert.ok(SECTION_TYPE_INFO[type], type);
		assert.ok(SECTION_TYPE_INFO[type].label.length > 0, type);
		assert.ok(SECTION_TYPE_INFO[type].help.length > 0, type);
	}
	assert.equal(isPageSectionType('HERO'), true);
	assert.equal(isPageSectionType('CUSTOM'), false);
	assert.equal(isPageSectionType('nonsense'), false);
});

test('a hero keeps only the values that were filled in', () => {
	const parsed = pageSectionSchema.safeParse({
		sectionType: 'HERO',
		title: 'Welcome home',
		subtitle: '',
		imageUrl: 'https://cdn.example.com/hero.jpg',
		primaryCtaLabel: 'Plan a visit',
		primaryCtaHref: '/plan-a-visit',
		secondaryCtaLabel: 'Watch',
		secondaryCtaHref: ''
	});
	assert.equal(parsed.success, true);
	if (!parsed.success) return;

	assert.deepEqual(toSectionConfig(parsed.data), {
		title: 'Welcome home',
		imageUrl: 'https://cdn.example.com/hero.jpg',
		primaryCta: { label: 'Plan a visit', href: '/plan-a-visit' }
	});
});

test('a background image must be http(s), because it goes into a src attribute', () => {
	const bad = pageSectionSchema.safeParse({
		sectionType: 'HERO',
		imageUrl: 'javascript:alert(1)'
	});
	assert.equal(bad.success, false);
});

test('an unknown section type is refused', () => {
	assert.equal(pageSectionSchema.safeParse({ sectionType: 'CUSTOM' }).success, false);
	assert.equal(pageSectionSchema.safeParse({ sectionType: '' }).success, false);
});

test('the events rail limit stays within range', () => {
	assert.equal(pageSectionSchema.safeParse({ sectionType: 'EVENTS_RAIL', limit: '3' }).success, true);
	assert.equal(pageSectionSchema.safeParse({ sectionType: 'EVENTS_RAIL', limit: '0' }).success, false);
	assert.equal(
		pageSectionSchema.safeParse({ sectionType: 'EVENTS_RAIL', limit: String(MAX_EVENTS_RAIL_LIMIT + 1) }).success,
		false
	);
	const empty = pageSectionSchema.safeParse({ sectionType: 'EVENTS_RAIL', limit: '' });
	assert.equal(empty.success, true);
	if (empty.success) assert.equal(empty.data.limit, undefined);
});

test('a page slug must be a path', () => {
	for (const slug of ['/about', '/', '/about-us', '/a/b']) {
		assert.equal(pageSchema.safeParse({ title: 'T', slug }).success, true, slug);
	}
	for (const slug of ['about', '/About', '/about us', '/about--', 'https://x.org/about']) {
		assert.equal(pageSchema.safeParse({ title: 'T', slug }).success, false, slug);
	}
});

test('a page needs a title', () => {
	assert.equal(pageSchema.safeParse({ title: '', slug: '/about' }).success, false);
});
