import type { BlogCardVm } from '../blog/types.js';
import type { EventCardVm } from '../events/types.js';
import type { FaqVm } from '../faq/types.js';
import type { GroupCardVm } from '../groups/types.js';
import type { LeaderVm } from '../leaders/types.js';
import type { RichSectionVm } from '../serve/types.js';
import type { TestimonialVm } from '../testimonials/types.js';
import type { FormFieldDef } from '../forms/form-fields.js';

export type HomeHeroVm = {
	title: string;
	subtitle?: string;
	imageUrl?: string;
	/** YouTube watch or youtu.be URL — plays as subtle background when set. */
	videoUrl?: string;
	primaryCta?: { label: string; href: string };
	secondaryCta?: { label: string; href: string };
};

export type HomeEventsRailVm = {
	title?: string;
	limit: number;
	events: EventCardVm[];
};

export type HomeBlogVm = {
	title?: string;
	posts: BlogCardVm[];
};

export type HomeTestimonialsVm = {
	title?: string;
	items: TestimonialVm[];
};

export type HomeGroupsVm = {
	title?: string;
	groups: GroupCardVm[];
};

export type HomeLeadersVm = {
	title?: string;
	leaders: LeaderVm[];
};

export type HomeFaqVm = {
	title?: string;
	items: FaqVm[];
};

export type HomeContactVm = {
	title?: string;
	intro?: string;
};

/**
 * A form staff designed themselves.
 *
 * `sectionId` is part of the data rather than the block wrapper because the
 * public composer does not tag blocks with their section (only the editor's
 * preview does), and the form posts to `/forms/<sectionId>`.
 */
export type HomeFormVm = {
	sectionId: number;
	title: string;
	intro?: string;
	/** Icon name from `packages/ui/src/icons.ts`, if staff picked one. */
	icon?: string;
	fields: FormFieldDef[];
	submitLabel: string;
	successMessage: string;
};

export type HomeCustomVm = Record<string, unknown>;

type HomeSectionBlockVariant =
	| { kind: 'HERO'; data: HomeHeroVm }
	| { kind: 'EVENTS_RAIL'; data: HomeEventsRailVm }
	| { kind: 'BLOG'; data: HomeBlogVm }
	| { kind: 'TESTIMONIALS'; data: HomeTestimonialsVm }
	| { kind: 'GROUPS'; data: HomeGroupsVm }
	| { kind: 'SERVE'; data: RichSectionVm | null }
	| { kind: 'LEADERS'; data: HomeLeadersVm }
	| { kind: 'IM_NEW'; data: RichSectionVm | null }
	| { kind: 'PARENTS'; data: RichSectionVm | null }
	| { kind: 'FAQ'; data: HomeFaqVm }
	| { kind: 'CONTACT'; data: HomeContactVm }
	| { kind: 'FORM'; data: HomeFormVm }
	| { kind: 'CUSTOM'; data: HomeCustomVm };

/**
 * `sectionId` and `draft` are only ever set by `composePreviewPage` (the
 * staff editor's live preview) — `composePublicPage` leaves them undefined,
 * so the public render is unaffected. Kept on the shared type rather than a
 * second one so every section component takes the same `data` shape either
 * way.
 */
export type HomeSectionBlock = HomeSectionBlockVariant & {
	/** The `page_sections.id` this block came from. */
	sectionId?: number;
	/** True when the section is DRAFT — still shown in the preview, flagged. */
	draft?: boolean;
};
