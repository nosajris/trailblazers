import test from 'node:test';
import assert from 'node:assert/strict';
import {
	BLOCKS,
	PAGE_SECTION_TYPES,
	fieldsFor,
	flattenConfig,
	formFieldNames,
	isPageSectionType,
	patchBlockConfig,
	projectConfig,
	readBlockConfig,
	searchBlocks
} from './block-registry.js';
import { pageSectionFields, pageSectionSchema } from './validation.js';

test('every section type is declared once, completely', () => {
	for (const type of PAGE_SECTION_TYPES) {
		const block = BLOCKS[type];
		assert.ok(block, type);
		assert.equal(block.kind, type, `${type} declares a mismatched kind`);
		assert.ok(block.label.length > 0, type);
		assert.ok(block.help.length > 0, type);
		assert.ok(block.icon.length > 0, type);
		// A block whose content comes from its own module takes no config fields,
		// and one that takes fields is not sourced — never both, never neither.
		assert.equal(block.sourced === true, block.fields.length === 0, type);
	}

	assert.equal(isPageSectionType('HERO'), true);
	assert.equal(isPageSectionType('CUSTOM'), false);
	assert.equal(isPageSectionType('nonsense'), false);
});

test('a field name is unique within its block', () => {
	for (const type of PAGE_SECTION_TYPES) {
		const names = fieldsFor(type).map((f) => f.name);
		assert.deepEqual(names, [...new Set(names)], type);
	}
});

test('a hero call to action survives the trip from the form to the rendered block', () => {
	// The regression this guards: the save path wrote `primaryCta: { label, href }`
	// while the render path read `primaryCtaLabel` / `primaryCtaHref`, so every
	// hero button the editor previewed was missing from the public page.
	const config = projectConfig('HERO', {
		title: 'Welcome home',
		primaryCtaLabel: 'Plan a visit',
		primaryCtaHref: '/plan-a-visit'
	});

	const data = readBlockConfig('HERO', config);
	assert.deepEqual(data.primaryCta, { label: 'Plan a visit', href: '/plan-a-visit' });
});

test('half a call to action renders no button', () => {
	const config = projectConfig('HERO', { primaryCtaLabel: 'Plan a visit', primaryCtaHref: '' });
	assert.equal(readBlockConfig('HERO', config).primaryCta, undefined);

	const other = projectConfig('HERO', { primaryCtaLabel: '', primaryCtaHref: '/plan-a-visit' });
	assert.equal(readBlockConfig('HERO', other).primaryCta, undefined);
});

test('config keeps only the fields its own block declares', () => {
	// A title typed into the form while a sourced block was selected used to be
	// stored anyway, where nothing would ever render it.
	assert.deepEqual(projectConfig('IM_NEW', { title: 'Stowaway', limit: '3' }), {});

	assert.deepEqual(projectConfig('CONTACT', { title: 'Say hello', intro: 'We would love to meet you.', imageUrl: 'https://cdn.example.com/x.webp' }), {
		title: 'Say hello',
		intro: 'We would love to meet you.'
	});
});

test('a blank value is dropped rather than stored as an empty string', () => {
	assert.deepEqual(projectConfig('HERO', { title: 'Welcome', subtitle: '', videoUrl: '' }), {
		title: 'Welcome'
	});
});

test('a block that declares a fallback title renders it when the title is blank', () => {
	assert.equal(readBlockConfig('HERO', {}).title, 'Welcome');
	assert.equal(readBlockConfig('CONTACT', {}).title, 'Contact');
	// The rest leave it undefined on purpose: their component owns the fallback.
	assert.equal(readBlockConfig('GROUPS', {}).title, undefined);
});

test('a count is clamped to the range its field declares', () => {
	const field = fieldsFor('EVENTS_RAIL').find((f) => f.name === 'limit');
	assert.ok(field?.kind === 'count');
	assert.equal(readBlockConfig('EVENTS_RAIL', { limit: 999 }).limit, field.max);
	assert.equal(readBlockConfig('EVENTS_RAIL', { limit: 0 }).limit, field.min);
	assert.equal(readBlockConfig('EVENTS_RAIL', {}).limit, field.fallbackCount);
});

test('the editor preview and the public render agree on every patchable field', () => {
	// `patchBlockConfig` is what the live preview applies while staff type, and
	// `readBlockConfig` is what the public page renders. If the two could drift,
	// the preview would be a lie — so the patch is built from the same projection
	// and this asserts the invariant for every block.
	const values = {
		title: 'Typed title',
		subtitle: 'Typed subtitle',
		intro: 'Typed intro',
		imageUrl: 'https://cdn.example.com/hero.webp',
		videoUrl: 'https://youtu.be/abc123',
		primaryCtaLabel: 'Go',
		primaryCtaHref: '/go',
		secondaryCtaLabel: 'Watch',
		secondaryCtaHref: '/watch',
		limit: '4'
	};

	for (const type of PAGE_SECTION_TYPES) {
		const rendered = readBlockConfig(type, projectConfig(type, values));
		const patched = patchBlockConfig(type, values);

		for (const field of fieldsFor(type)) {
			if (field.requeriesOnChange) {
				// Needs a fresh server query, so the preview deliberately leaves it alone.
				assert.equal(patched[field.name as 'limit'], undefined, `${type}.${field.name}`);
				continue;
			}
			const key = field.kind === 'cta' ? field.name : field.name;
			assert.deepEqual(
				patched[key as keyof typeof patched],
				rendered[key as keyof typeof rendered],
				`${type}.${field.name}`
			);
		}
	}
});

test('every field a block declares is validated before it reaches jsonb', () => {
	// The registry decides which settings a block has; `pageSectionSchema`
	// decides whether a submitted value is safe to store. If a field were added
	// to a block with no validator, anything at all could land in jsonb and
	// reach a public page — so the two are asserted to line up here. Add the
	// matching validator in `validation.ts` when this fails.
	const validated = new Set(Object.keys(pageSectionFields.shape));

	for (const type of PAGE_SECTION_TYPES) {
		for (const name of formFieldNames(type)) {
			assert.ok(validated.has(name), `${type}.${name} has no validator in pageSectionSchema`);
		}
	}
});

test('a value longer than its field allows is refused', () => {
	const tooLong = pageSectionSchema.safeParse({
		sectionType: 'HERO',
		title: 'x'.repeat(121)
	});
	assert.equal(tooLong.success, false);
});

test('opening a saved section in the editor gives back exactly what was typed', () => {
	// `flattenConfig` is the editor's read path and `projectConfig` its write
	// path. If they disagreed, opening a section would quietly blank a field and
	// the next autosave would delete it — so the round trip is asserted here.
	const typed: Record<string, string> = {
		title: 'Welcome home',
		subtitle: 'Every Sunday, 9am',
		imageUrl: 'https://cdn.example.com/hero.webp',
		videoUrl: 'https://youtu.be/abc123',
		primaryCtaLabel: 'Plan a visit',
		primaryCtaHref: '/plan-a-visit',
		secondaryCtaLabel: 'Watch',
		secondaryCtaHref: '/watch'
	};

	const flattened = flattenConfig('HERO', projectConfig('HERO', typed));
	for (const [name, value] of Object.entries(typed)) {
		assert.equal(flattened[name], value, name);
	}
});

test('a field never filled in opens as an empty string, not as "undefined"', () => {
	const flattened = flattenConfig('HERO', projectConfig('HERO', { title: 'Only a title' }));
	assert.equal(flattened.subtitle, '');
	assert.equal(flattened.primaryCtaLabel, '');
	assert.equal(flattened.primaryCtaHref, '');
	// Every form field the block declares is present, so `bind:value` has a key.
	assert.deepEqual(Object.keys(flattened).sort(), formFieldNames('HERO').sort());
});

test('a block can be found by its label or its description', () => {
	assert.equal(searchBlocks('hero')[0], 'HERO');
	assert.equal(searchBlocks('upcoming')[0], 'EVENTS_RAIL');
	assert.equal(searchBlocks('testimonials')[0], 'TESTIMONIALS');
	// By description: nothing in the hero's label says "photo".
	assert.ok(searchBlocks('photo').includes('HERO'));
	// A label match outranks a description match.
	assert.equal(searchBlocks('stories')[0], 'BLOG');
});

test('a blank block search offers every type, in declaration order', () => {
	assert.deepEqual(searchBlocks(''), [...PAGE_SECTION_TYPES]);
	assert.deepEqual(searchBlocks('zzzzz'), []);
});

test('a form block will not save until its questions can actually be answered', () => {
	const base = { sectionType: 'FORM', title: 'Get in touch' };

	// No questions at all, and questions with no way to reply, are both refused
	// while staff are still building the section.
	assert.equal(pageSectionSchema.safeParse(base).success, false);
	assert.equal(
		pageSectionSchema.safeParse({ ...base, fieldsText: 'Your name | text' }).success,
		false
	);

	const good = pageSectionSchema.safeParse({
		...base,
		fieldsText: 'Your name | text | required\nEmail | email | required'
	});
	assert.equal(good.success, true);
});

test('the questions are only checked for the block that has them', () => {
	// A hero has no `fieldsText`, so the form rule must not reject it.
	assert.equal(pageSectionSchema.safeParse({ sectionType: 'HERO', title: 'Welcome' }).success, true);
});
