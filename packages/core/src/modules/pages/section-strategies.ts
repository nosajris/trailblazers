import { createBlogService } from '../blog/service.js';
import { createEventService } from '../events/service.js';
import { createFaqService } from '../faq/service.js';
import { createGroupService } from '../groups/service.js';
import { createLeaderService } from '../leaders/service.js';
import { createNewcomerService } from '../newcomers/service.js';
import { createParentService } from '../parents/service.js';
import { createServeService } from '../serve/service.js';
import { createTestimonialService } from '../testimonials/service.js';
import { formFieldsProblem, parseFormFields } from '../forms/form-fields.js';
import { readBlockConfig } from './block-registry.js';
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

/**
 * How each block gets the data its component renders.
 *
 * A strategy's only job is the part the registry cannot do: fetching records
 * from another module. Reading `config` — which settings this block has, how a
 * call to action is paired, what a blank title means, how a count is clamped —
 * is `readBlockConfig`, the same function the editor's preview goes through, so
 * the published page and the preview cannot disagree.
 */
export function createSectionStrategyRegistry(services: SectionStrategyServices) {
	const cfg = (s: PageSectionRow) => (s.config ?? {}) as Record<string, unknown>;

	return {
		HERO: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			const c = readBlockConfig('HERO', cfg(section));
			return {
				kind: 'HERO',
				data: {
					// A hero's title field declares a fallback, so it is always set —
					// asserted in `block-registry.test.ts`.
					title: c.title as string,
					subtitle: c.subtitle,
					imageUrl: c.imageUrl,
					videoUrl: c.videoUrl,
					primaryCta: c.primaryCta,
					secondaryCta: c.secondaryCta
				}
			};
		},

		EVENTS_RAIL: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			const { title, limit = 3 } = readBlockConfig('EVENTS_RAIL', cfg(section));
			const events = await services.events.listUpcomingForHome(limit);
			return { kind: 'EVENTS_RAIL', data: { title, limit, events } };
		},

		BLOG: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			const { title, limit = 3 } = readBlockConfig('BLOG', cfg(section));
			const posts = await services.blog.listLatest(limit);
			return { kind: 'BLOG', data: { title, posts } };
		},

		TESTIMONIALS: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			const { title } = readBlockConfig('TESTIMONIALS', cfg(section));
			const items = await services.testimonials.listPublished();
			return { kind: 'TESTIMONIALS', data: { title, items } };
		},

		GROUPS: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			const { title } = readBlockConfig('GROUPS', cfg(section));
			const groups = await services.groups.listPublished();
			return { kind: 'GROUPS', data: { title, groups } };
		},

		SERVE: async (): Promise<HomeSectionBlock | null> => {
			const data = await services.serve.getPrimaryPublished();
			return { kind: 'SERVE', data };
		},

		LEADERS: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			const { title } = readBlockConfig('LEADERS', cfg(section));
			const leaders = await services.leaders.listPublished();
			return { kind: 'LEADERS', data: { title, leaders } };
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
			const { title } = readBlockConfig('FAQ', cfg(section));
			const items = await services.faq.listPublished();
			return { kind: 'FAQ', data: { title, items } };
		},

		CONTACT: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			const { title, intro } = readBlockConfig('CONTACT', cfg(section));
			return { kind: 'CONTACT', data: { title, intro } };
		},

		FORM: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			const c = readBlockConfig('FORM', cfg(section));
			const fields = parseFormFields(c.fieldsText ?? '');

			// A form whose questions cannot be answered renders nothing at all,
			// the same rule site settings follow (ADR 0008): a half-built section
			// is better absent than present and broken. Saving one is already
			// refused by `pageSectionSchema`, so this only catches a row that
			// predates the rule.
			if (formFieldsProblem(fields)) return null;

			return {
				kind: 'FORM',
				data: {
					sectionId: section.id,
					// The registry declares a fallback for each of these three.
					title: c.title as string,
					submitLabel: c.submitLabel as string,
					successMessage: c.successMessage as string,
					intro: c.intro,
					icon: c.icon,
					fields
				}
			};
		},

		CUSTOM: async (section: PageSectionRow): Promise<HomeSectionBlock | null> => {
			return { kind: 'CUSTOM', data: cfg(section) };
		}
	};
}

export { createSectionStrategyServices };
