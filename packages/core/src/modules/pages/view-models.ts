import type { BlogCardVm } from '../blog/types.js';
import type { EventCardVm } from '../events/types.js';
import type { FaqVm } from '../faq/types.js';
import type { GroupCardVm } from '../groups/types.js';
import type { LeaderVm } from '../leaders/types.js';
import type { RichSectionVm } from '../serve/types.js';
import type { TestimonialVm } from '../testimonials/types.js';

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

export type HomeCustomVm = Record<string, unknown>;

export type HomeSectionBlock =
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
	| { kind: 'CUSTOM'; data: HomeCustomVm };
