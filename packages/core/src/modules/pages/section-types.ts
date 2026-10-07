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

export type SectionTypeInfo = {
	label: string;
	/** One line for the staff editor: what this puts on the page. */
	help: string;
	fields: SectionFieldSet;
};

export const SECTION_TYPE_INFO: Record<PageSectionType, SectionTypeInfo> = {
	HERO: {
		label: 'Hero banner',
		help: 'The big opening band: headline, short line, background photo or video, and up to two buttons.',
		fields: 'hero'
	},
	EVENTS_RAIL: {
		label: 'Upcoming events',
		help: 'Cards for the next few published events.',
		fields: 'titleAndLimit'
	},
	BLOG: { label: 'Stories', help: 'The latest published stories.', fields: 'titleOnly' },
	TESTIMONIALS: {
		label: 'Testimonials',
		help: 'Published testimonials. Unpublish the placeholders before using this.',
		fields: 'titleOnly'
	},
	GROUPS: { label: 'Groups', help: 'Published groups, as cards.', fields: 'titleOnly' },
	LEADERS: { label: 'Leaders', help: 'Published leaders, with photos.', fields: 'titleOnly' },
	IM_NEW: {
		label: "I'm new",
		help: 'The newcomer block, edited under Newcomers.',
		fields: 'none'
	},
	SERVE: { label: 'Serve', help: 'The serve block, edited under Serve.', fields: 'none' },
	PARENTS: { label: 'Parents', help: 'The parents block, edited under Parents.', fields: 'none' },
	FAQ: { label: 'FAQ', help: 'Published questions and answers.', fields: 'titleOnly' },
	CONTACT: {
		label: 'Contact invitation',
		help: 'A short invitation to get in touch.',
		fields: 'titleAndIntro'
	}
};

export function isPageSectionType(value: string): value is PageSectionType {
	return (PAGE_SECTION_TYPES as readonly string[]).includes(value);
}
