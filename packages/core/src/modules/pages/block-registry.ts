/**
 * The one declaration of every page block: what it is called, which settings it
 * takes, and how those settings turn into the data a component renders.
 *
 * Why a registry rather than a list of types. A block used to be described in
 * four places — editor metadata here, a flat zod schema and a hand-written
 * form-to-config mapper in `validation.ts`, a config reader per type in
 * `section-strategies.ts`, and a patch branch per type in the editor's live
 * preview. Nothing tied them together, so they drifted: the save path wrote
 * `primaryCta: { label, href }` while the hero's render path read
 * `primaryCtaLabel`, meaning every hero button staff previewed was absent from
 * the public page. Config was also stored for fields a block does not have.
 *
 * Now a block declares its fields once and the four paths are derived from that
 * declaration:
 *
 * - the editor renders inputs from `fieldsFor(kind)`;
 * - `projectConfig` keeps only the declared fields when saving;
 * - `readBlockConfig` reads them back for the public render;
 * - `patchBlockConfig` is `readBlockConfig` over the same projection, so the
 *   live preview cannot disagree with the published page.
 *
 * Adding a block is one entry in `BLOCKS` plus its component and (if it needs
 * data from its own module) a loader in `section-strategies.ts`. This file is
 * imported by the admin app in the browser, so it stays free of database and
 * Node dependencies.
 */

export const PAGE_SECTION_TYPES = [
	'HERO',
	'EVENTS_RAIL',
	'BLOG',
	'TESTIMONIALS',
	'GROUPS',
	'LEADERS',
	'IM_NEW',
	'SERVE',
	'PARENTS',
	'FAQ',
	'CONTACT',
	'FORM'
] as const;

export type PageSectionType = (typeof PAGE_SECTION_TYPES)[number];

/**
 * How one setting is edited and rendered.
 *
 * - `text` / `longText` — a heading or a paragraph; `longText` gets a textarea.
 * - `image` / `video` — a URL that reaches a `src` attribute, so it is
 *   restricted to http(s) when validated and offers the media picker.
 * - `cta` — a label and a destination edited as a pair. A `cta` named `foo`
 *   owns the form fields `fooLabel` and `fooHref` and stores `foo:
 *   { label, href }`; neither half renders alone.
 * - `count` — how many records to show, clamped to the field's own range.
 * - `icon` — a name from `packages/ui/src/icons.ts`, chosen with the searchable
 *   picker. `icons.test.ts` asserts every name a block declares exists there.
 * - `lines` — a list edited as one record per line, parsed by that block's own
 *   pure functions (see `modules/forms/form-fields.ts`). The same shape site
 *   settings use for giving methods and campuses, per ADR 0008.
 */
export type BlockFieldKind =
	| 'text'
	| 'longText'
	| 'image'
	| 'video'
	| 'cta'
	| 'count'
	| 'icon'
	| 'lines';

export type BlockField = {
	/** The config key this field reads and writes. */
	name: string;
	kind: BlockFieldKind;
	/** The editor's label for the input. */
	label: string;
	/** One line under the input: what it does, or what blank means. */
	help?: string;
	/** Greyed-out example shown in an empty input. */
	placeholder?: string;
	/** Longest accepted value, for `text`, `longText` and a `cta` label. */
	maxLength?: number;
	/** `count` only: the accepted range and what is shown when it is blank. */
	min?: number;
	max?: number;
	fallbackCount?: number;
	/**
	 * What the public page renders when the value is blank. Only set where the
	 * block itself needs a value; elsewhere the component owns its fallback and
	 * this stays undefined so the component keeps that job.
	 */
	fallback?: string;
	/**
	 * True when changing the value needs a fresh server query (a count changes
	 * how many events are fetched). The live preview leaves these alone until
	 * the section is saved, rather than showing a stale list under a new number.
	 */
	requeriesOnChange?: boolean;
};

export type BlockDefinition = {
	kind: PageSectionType;
	/** What staff see in the type picker. */
	label: string;
	/** One line in the editor: what this puts on the page. */
	help: string;
	/** Icon name from `packages/ui/src/icons.ts`, drawn beside the block. */
	icon: string;
	fields: BlockField[];
	/**
	 * True when the block's content is edited elsewhere in the portal (the
	 * Serve, Newcomers and Parents screens own theirs). Such a block takes no
	 * settings here, and the editor says where to go instead.
	 */
	sourced?: boolean;
	/**
	 * The heading the component falls back to when the title is blank, shown as
	 * a hint in the editor so staff know blank is a real choice. Where the block
	 * itself supplies the fallback it is also the title field's `fallback`.
	 */
	defaultTitle?: string;
};

const title = (over: Partial<BlockField> = {}): BlockField => ({
	name: 'title',
	kind: 'text',
	label: 'Heading',
	maxLength: 120,
	...over
});

const count = (over: Partial<BlockField> = {}): BlockField => ({
	name: 'limit',
	kind: 'count',
	label: 'How many to show',
	min: 1,
	max: 12,
	fallbackCount: 3,
	requeriesOnChange: true,
	...over
});

export const BLOCKS: Record<PageSectionType, BlockDefinition> = {
	HERO: {
		kind: 'HERO',
		label: 'Hero banner',
		help: 'The big opening band: headline, short line, background photo or video, and up to two buttons.',
		icon: 'layout',
		defaultTitle: 'Welcome',
		fields: [
			title({ help: 'Left blank this reads "Welcome".', fallback: 'Welcome' }),
			{ name: 'subtitle', kind: 'longText', label: 'Short line', maxLength: 300 },
			{
				name: 'imageUrl',
				kind: 'image',
				label: 'Background photo',
				placeholder: 'https://...',
				help: "Upload a photo and it's resized and compressed automatically — or paste a link."
			},
			{
				name: 'videoUrl',
				kind: 'video',
				label: 'Background video (YouTube)',
				placeholder: 'https://youtu.be/...',
				help: 'Plays quietly behind the headline. Phones and metered connections always get the photo.'
			},
			{
				name: 'primaryCta',
				kind: 'cta',
				label: 'Main button',
				maxLength: 40,
				placeholder: '/plan-a-visit',
				help: 'A button appears only when it has both a label and a link.'
			},
			{
				name: 'secondaryCta',
				kind: 'cta',
				label: 'Second button',
				maxLength: 40,
				placeholder: '/watch'
			}
		]
	},

	EVENTS_RAIL: {
		kind: 'EVENTS_RAIL',
		label: 'Upcoming events',
		help: 'Cards for the next few published events.',
		icon: 'calendar',
		defaultTitle: 'Upcoming events',
		fields: [
			title(),
			count({
				help: 'Counts only published, upcoming events — a past or draft event never fills a slot.'
			})
		]
	},

	BLOG: {
		kind: 'BLOG',
		label: 'Stories',
		help: 'The latest published stories.',
		icon: 'book',
		defaultTitle: 'Stories & updates',
		fields: [title(), count({ help: 'The newest published stories fill these slots.' })]
	},

	TESTIMONIALS: {
		kind: 'TESTIMONIALS',
		label: 'Testimonials',
		help: 'Published testimonials. Unpublish the placeholders before using this.',
		icon: 'quote',
		defaultTitle: 'What people are saying',
		fields: [title()]
	},

	GROUPS: {
		kind: 'GROUPS',
		label: 'Groups',
		help: 'Published groups, as cards.',
		icon: 'users',
		defaultTitle: 'Connect in community',
		fields: [title()]
	},

	LEADERS: {
		kind: 'LEADERS',
		label: 'Leaders',
		help: 'Published leaders, with photos.',
		icon: 'badge',
		defaultTitle: 'Leadership',
		fields: [title()]
	},

	IM_NEW: {
		kind: 'IM_NEW',
		label: "I'm new",
		help: 'The newcomer block. Its wording is edited under Newcomers.',
		icon: 'heart',
		sourced: true,
		fields: []
	},

	SERVE: {
		kind: 'SERVE',
		label: 'Serve',
		help: 'The serve block. Its wording is edited under Serve.',
		icon: 'hand',
		sourced: true,
		fields: []
	},

	PARENTS: {
		kind: 'PARENTS',
		label: 'Parents',
		help: 'The parents block. Its wording is edited under Parents.',
		icon: 'baby',
		sourced: true,
		fields: []
	},

	FAQ: {
		kind: 'FAQ',
		label: 'FAQ',
		help: 'Published questions and answers.',
		icon: 'help',
		defaultTitle: 'Questions',
		fields: [title()]
	},

	FORM: {
		kind: 'FORM',
		label: 'Form',
		help: 'A form you write the questions for. Answers arrive under Submissions.',
		icon: 'send',
		defaultTitle: 'Get in touch',
		fields: [
			title({ help: 'Left blank this reads "Get in touch".', fallback: 'Get in touch' }),
			{
				name: 'intro',
				kind: 'longText',
				label: 'Introduction',
				maxLength: 300,
				help: 'A line or two above the questions.'
			},
			{
				name: 'icon',
				kind: 'icon',
				label: 'Icon',
				help: 'Optional, shown beside the heading.'
			},
			{
				name: 'fieldsText',
				kind: 'lines',
				label: 'Questions',
				maxLength: 2000,
				help: 'One per line: Label | kind | required. Kinds are text, long, email, phone, or choice: a, b, c. One question must be an email field, because that is how staff reply.'
			},
			{
				name: 'submitLabel',
				kind: 'text',
				label: 'Button label',
				maxLength: 40,
				fallback: 'Send',
				placeholder: 'Send'
			},
			{
				name: 'successMessage',
				kind: 'longText',
				label: 'Thank-you message',
				maxLength: 300,
				fallback: 'Thank you — we have your message and will be in touch.',
				help: 'Shown in place of the form once it has been sent.'
			}
		]
	},

	CONTACT: {
		kind: 'CONTACT',
		label: 'Contact invitation',
		help: 'A short invitation to get in touch.',
		icon: 'mail',
		defaultTitle: 'Contact',
		fields: [
			title({ help: 'Left blank this reads "Contact".', fallback: 'Contact' }),
			{ name: 'intro', kind: 'longText', label: 'Invitation', maxLength: 300 }
		]
	}
};

export function isPageSectionType(value: string): value is PageSectionType {
	return (PAGE_SECTION_TYPES as readonly string[]).includes(value);
}

export function fieldsFor(kind: PageSectionType): BlockField[] {
	return BLOCKS[kind].fields;
}

/** Every form field name a block submits — a `cta` contributes two. */
export function formFieldNames(kind: PageSectionType): string[] {
	return fieldsFor(kind).flatMap((field) =>
		field.kind === 'cta' ? [`${field.name}Label`, `${field.name}Href`] : [field.name]
	);
}

/**
 * The editor's "add a section" search.
 *
 * With a handful of blocks a grid of every type was enough to scan; as the set
 * grows, staff need to type what they want. Matches a block's label first, then
 * its description, so "event" finds Upcoming events and "photo" finds the hero
 * (whose description mentions one).
 *
 * A blank query returns every type in declaration order, which is what the
 * unfiltered grid shows.
 */
export function searchBlocks(
	query: string,
	types: readonly PageSectionType[] = PAGE_SECTION_TYPES
): PageSectionType[] {
	const needle = query.trim().toLowerCase();
	if (needle === '') return [...types];

	const scored: { type: PageSectionType; score: number }[] = [];

	for (const type of types) {
		const block = BLOCKS[type];
		const label = block.label.toLowerCase();

		let score = 0;
		if (label === needle) score = 4;
		else if (label.startsWith(needle)) score = 3;
		else if (label.includes(needle)) score = 2;
		else if (block.help.toLowerCase().includes(needle)) score = 1;

		if (score > 0) scored.push({ type, score });
	}

	return scored
		.sort((a, b) => b.score - a.score || BLOCKS[a.type].label.localeCompare(BLOCKS[b.type].label))
		.map((entry) => entry.type);
}

/** The flat shape the editor submits: one string per input, `limit` as typed. */
export type FlatSectionValues = Record<string, unknown>;

/** The data a block's component reads, once config has been interpreted. */
export type BlockConfigData = {
	title?: string;
	subtitle?: string;
	intro?: string;
	imageUrl?: string;
	videoUrl?: string;
	icon?: string;
	fieldsText?: string;
	submitLabel?: string;
	successMessage?: string;
	limit?: number;
	primaryCta?: { label: string; href: string };
	secondaryCta?: { label: string; href: string };
};

function text(value: unknown): string | undefined {
	if (typeof value === 'number') return String(value);
	if (typeof value !== 'string') return undefined;
	const trimmed = value.trim();
	return trimmed === '' ? undefined : trimmed;
}

/**
 * Turns the editor's flat values into the `config` that is stored as jsonb.
 *
 * Only the fields the chosen block declares are kept, so switching a section's
 * type cannot leave a stray setting behind that nothing renders, and a blank is
 * dropped rather than stored as an empty string.
 */
export function projectConfig(
	kind: PageSectionType,
	values: FlatSectionValues
): Record<string, unknown> {
	const config: Record<string, unknown> = {};

	for (const field of fieldsFor(kind)) {
		if (field.kind === 'cta') {
			const label = text(values[`${field.name}Label`]);
			const href = text(values[`${field.name}Href`]);
			// Both halves or neither: a button with no destination is worse than none.
			if (label && href) config[field.name] = { label, href };
			continue;
		}

		if (field.kind === 'count') {
			const raw = text(values[field.name]);
			if (raw === undefined) continue;
			const parsed = Number(raw);
			if (Number.isFinite(parsed)) config[field.name] = Math.trunc(parsed);
			continue;
		}

		const value = text(values[field.name]);
		if (value !== undefined) config[field.name] = value;
	}

	return config;
}

/**
 * Turns a stored config back into the flat values the editor binds to — the
 * inverse of `projectConfig`, and the editor's read path when staff open a
 * saved section.
 *
 * Every form field the block declares gets a key, blank ones as an empty
 * string, so each input has something to bind to and an untouched field cannot
 * come back as the text "undefined".
 */
export function flattenConfig(
	kind: PageSectionType,
	config: Record<string, unknown>
): Record<string, string> {
	const values: Record<string, string> = {};

	for (const field of fieldsFor(kind)) {
		if (field.kind === 'cta') {
			const pair = (config[field.name] ?? {}) as { label?: unknown; href?: unknown };
			values[`${field.name}Label`] = text(pair.label) ?? '';
			values[`${field.name}Href`] = text(pair.href) ?? '';
			continue;
		}

		values[field.name] = text(config[field.name]) ?? '';
	}

	return values;
}

/**
 * Reads a stored config back into the data its component renders — the public
 * render path, and the one place that decides what a blank value means.
 */
export function readBlockConfig(
	kind: PageSectionType,
	config: Record<string, unknown>
): BlockConfigData {
	const data: BlockConfigData = {};

	for (const field of fieldsFor(kind)) {
		if (field.kind === 'cta') {
			const pair = config[field.name];
			if (pair && typeof pair === 'object') {
				const label = text((pair as { label?: unknown }).label);
				const href = text((pair as { href?: unknown }).href);
				if (label && href) {
					data[field.name as 'primaryCta' | 'secondaryCta'] = { label, href };
				}
			}
			continue;
		}

		if (field.kind === 'count') {
			const raw = config[field.name];
			const parsed = typeof raw === 'number' ? raw : Number(text(raw) ?? NaN);
			const fallback = field.fallbackCount ?? 3;
			const chosen = Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
			data.limit = Math.min(field.max ?? 12, Math.max(field.min ?? 1, chosen));
			continue;
		}

		const value = text(config[field.name]) ?? field.fallback;
		// Keyed by the field's declared name rather than a list of names kept in
		// step by hand — the list was the drift this registry exists to remove.
		if (value !== undefined) (data as Record<string, unknown>)[field.name] = value;
	}

	return data;
}

/**
 * What the editor's live preview applies while staff type, before anything is
 * saved.
 *
 * Deliberately `readBlockConfig` over the same projection the save path uses,
 * so the preview renders a section exactly as the public page will. Fields that
 * need a fresh query are dropped instead of guessed.
 */
export function patchBlockConfig(
	kind: PageSectionType,
	values: FlatSectionValues
): BlockConfigData {
	const data = readBlockConfig(kind, projectConfig(kind, values));

	for (const field of fieldsFor(kind)) {
		if (field.requeriesOnChange) delete data[field.name as keyof BlockConfigData];
	}

	return data;
}
