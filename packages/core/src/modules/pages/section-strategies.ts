import { createBlogService } from '../blog/service.js';
import { createEventService } from '../events/service.js';
import { createFaqService } from '../faq/service.js';
import { createGroupService } from '../groups/service.js';
import { createLeaderService } from '../leaders/service.js';
import { createNewcomerService } from '../newcomers/service.js';
import { createParentService } from '../parents/service.js';
import { createServeService } from '../serve/service.js';
import { createTestimonialService } from '../testimonials/service.js';
import type { pageSections } from './schema.js';
import type { HomeSectionBlock } from './view-models.js';

export type PageSectionRow = typeof pageSections.$inferSelect;

function createSectionStrategyServices(db: import('../../db/client.js').Database) {
	return {
		events: createEventService(db),
		blog: createBlogService(db),
		groups: createGroupService(db),
		testimonials: createTestimonialService(db),
		leaders: createLeaderService(db),
		faq: createFaqService(db),
		serve: createServeService(db),
		newcomers: createNewcomerService(db),
		parents: createParentService(db)
	};
}

export type SectionStrategyServices = ReturnType<typeof createSectionStrategyServices>;

export function createSectionStrategyRegistry(services: SectionStrategyServices) {
	const cfg = (s: PageSectionRow) => (s.config ?? {}) as Record<string, unknown>;

	return {
		HERO: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			const c = cfg(section);
			return {
				kind: 'HERO',
				data: {
					title: String(c.title ?? 'Welcome'),
					subtitle: c.subtitle ? String(c.subtitle) : undefined,
					imageUrl: c.imageUrl ? String(c.imageUrl) : undefined,
					videoUrl: c.videoUrl ? String(c.videoUrl) : undefined,
					primaryCta:
						c.primaryCtaLabel && c.primaryCtaHref
							? { label: String(c.primaryCtaLabel), href: String(c.primaryCtaHref) }
							: undefined,
					secondaryCta:
						c.secondaryCtaLabel && c.secondaryCtaHref
							? { label: String(c.secondaryCtaLabel), href: String(c.secondaryCtaHref) }
							: undefined
				}
			};
		},

		EVENTS_RAIL: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			const c = cfg(section);
			const limit = Math.min(20, Math.max(1, Number(c.limit ?? 3)));
			const events = await services.events.listUpcomingForHome(limit);
			return {
				kind: 'EVENTS_RAIL',
				data: { title: c.title ? String(c.title) : undefined, limit, events }
			};
		},

		BLOG: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			const c = cfg(section);
			const limit = Math.min(20, Math.max(1, Number(c.limit ?? 3)));
			const posts = await services.blog.listLatest(limit);
			return { kind: 'BLOG', data: { title: c.title ? String(c.title) : undefined, posts } };
		},

		TESTIMONIALS: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			const c = cfg(section);
			const items = await services.testimonials.listPublished();
			return { kind: 'TESTIMONIALS', data: { title: c.title ? String(c.title) : undefined, items } };
		},

		GROUPS: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			const c = cfg(section);
			const groups = await services.groups.listPublished();
			return { kind: 'GROUPS', data: { title: c.title ? String(c.title) : undefined, groups } };
		},

		SERVE: async (): Promise<HomeSectionBlock | null> => {
			const data = await services.serve.getPrimaryPublished();
			return { kind: 'SERVE', data };
		},

		LEADERS: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			const c = cfg(section);
			const leaders = await services.leaders.listPublished();
			return { kind: 'LEADERS', data: { title: c.title ? String(c.title) : undefined, leaders } };
		},

		IM_NEW: async (): Promise<HomeSectionBlock | null> => {
			const data = await services.newcomers.getPrimaryPublished();
			return { kind: 'IM_NEW', data };
		},

		PARENTS: async (): Promise<HomeSectionBlock | null> => {
			const data = await services.parents.getPrimaryPublished();
			return { kind: 'PARENTS', data };
		},

		FAQ: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			const c = cfg(section);
			const items = await services.faq.listPublished();
			return { kind: 'FAQ', data: { title: c.title ? String(c.title) : undefined, items } };
		},

		CONTACT: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			const c = cfg(section);
			return {
				kind: 'CONTACT',
				data: {
					title: c.title ? String(c.title) : 'Contact',
					intro: c.intro ? String(c.intro) : undefined
				}
			};
		},

		CUSTOM: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			return { kind: 'CUSTOM', data: cfg(section) };
		}
	};
}

export { createSectionStrategyServices };
