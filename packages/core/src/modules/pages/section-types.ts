/**
 * What each page section is, and which settings it takes.
 *
 * One definition shared by the staff editor and the validation that saves it,
 * so a new section type cannot be half-wired: add it here and the editor grows
 * the right fields.
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
	'CONTACT'
] as const;

export type PageSectionType = (typeof PAGE_SECTION_TYPES)[number];

/** Which config inputs a type needs. 'none' means its content comes from its own module. */
export type SectionFieldSet = 'hero' | 'titleAndLimit' | 'titleOnly' | 'titleAndIntro' | 'none';

/**
 * A named shape for the small glyph the staff editor draws next to a
 * section, so a type is recognisable at a glance instead of only by its
 * label text (Strata's editor does the same with its block icons).
 * Kept as a plain name here, not markup — the SVG itself lives in the
 * admin app, which is the presentation layer.
 */
export type SectionGlyph =
	'hero' | 'calendar' | 'book' | 'quote' | 'users' | 'badge' | 'heart' | 'baby' | 'help' | 'mail';

export type SectionTypeInfo = {
	label: string;
	/** One line for the staff editor: what this puts on the page. */
	help: string;
	fields: SectionFieldSet;
	glyph: SectionGlyph;
	/**
	 * The heading its component falls back to when the title is left
	 * blank (see each `packages/ui/src/home/*.svelte`). Shown as a hint
	 * in the editor so staff know blank is a real, named choice, not a
	 * mistake — only set where a title field exists.
	 */
	defaultTitle?: string;
};

export const SECTION_TYPE_INFO: Record<PageSectionType, SectionTypeInfo> = {
	HERO: {
		label: 'Hero banner',
		help: 'The big opening band: headline, short line, background photo or video, and up to two buttons.',
		fields: 'hero',
		glyph: 'hero',
		defaultTitle: 'Welcome'
	},
	EVENTS_RAIL: {
		label: 'Upcoming events',
		help: 'Cards for the next few published events.',
		fields: 'titleAndLimit',
		glyph: 'calendar',
		defaultTitle: 'Upcoming events'
	},
	BLOG: {
		label: 'Stories',
		help: 'The latest published stories.',
		fields: 'titleOnly',
		glyph: 'book',
		defaultTitle: 'Stories & updates'
	},
	TESTIMONIALS: {
		label: 'Testimonials',
		help: 'Published testimonials. Unpublish the placeholders before using this.',
		fields: 'titleOnly',
		glyph: 'quote',
		defaultTitle: 'What people are saying'
	},
	GROUPS: {
		label: 'Groups',
		help: 'Published groups, as cards.',
		fields: 'titleOnly',
		glyph: 'users',
		defaultTitle: 'Connect in community'
	},
	LEADERS: {
		label: 'Leaders',
		help: 'Published leaders, with photos.',
		fields: 'titleOnly',
		glyph: 'badge',
		defaultTitle: 'Leadership'
	},
	IM_NEW: {
		label: "I'm new",
		help: 'The newcomer block, edited under Newcomers.',
		fields: 'none',
		glyph: 'heart'
	},
	SERVE: {
		label: 'Serve',
		help: 'The serve block, edited under Serve.',
		fields: 'none',
		glyph: 'heart'
	},
	PARENTS: {
		label: 'Parents',
		help: 'The parents block, edited under Parents.',
		fields: 'none',
		glyph: 'baby'
	},
	FAQ: {
		label: 'FAQ',
		help: 'Published questions and answers.',
		fields: 'titleOnly',
		glyph: 'help',
		defaultTitle: 'Questions'
	},
	CONTACT: {
		label: 'Contact invitation',
		help: 'A short invitation to get in touch.',
		fields: 'titleAndIntro',
		glyph: 'mail',
		defaultTitle: 'Contact'
	}
};

export function isPageSectionType(value: string): value is PageSectionType {
	return (PAGE_SECTION_TYPES as readonly string[]).includes(value);
}
