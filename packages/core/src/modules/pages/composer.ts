import { and, asc, eq, max } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { pageSections, pages } from './schema.js';
import { createSectionStrategyRegistry, createSectionStrategyServices } from './section-strategies.js';
import type { HomeSectionBlock } from './view-models.js';

export function createPageComposerService(db: Database) {
	const services = createSectionStrategyServices(db);
	const registry = createSectionStrategyRegistry(services);

	return {
		async composePublicPage(slug: string): Promise<HomeSectionBlock[]> {
			const page = await db.query.pages.findFirst({
				where: and(eq(pages.slug, slug), eq(pages.status, 'PUBLISHED'))
			});
			if (!page) return [];

			const sections = await db
				.select()
				.from(pageSections)
				.where(and(eq(pageSections.pageId, page.id), eq(pageSections.status, 'PUBLISHED')))
				.orderBy(asc(pageSections.sortOrder), asc(pageSections.id));

			// Each section's data loader is independent (events, blog, groups, etc. don't
			// depend on one another), so fetch them concurrently instead of one at a time —
			// this turns N sequential DB round trips into 1 round trip's worth of latency.
			const results = await Promise.all(
				sections.map((section) => {
					const loader = registry[section.sectionType] as
						| ((s: typeof section) => Promise<HomeSectionBlock | null>)
						| undefined;
					return loader ? loader(section) : Promise.resolve(null);
				})
			);

			return results.filter((block): block is HomeSectionBlock => block !== null);
		},

		/** Published page slugs, for the sitemap. */
		async listPublishedSlugs(): Promise<string[]> {
			const rows = await db
				.select({ slug: pages.slug })
				.from(pages)
				.where(eq(pages.status, 'PUBLISHED'));
			return rows.map((row) => row.slug);
		},

		async getAllPagesForAdmin() {
			return db.select().from(pages);
		},

		/**
		 * One page and its sections for the staff editor.
		 *
		 * Pages could be created in the portal but their sections could not be
		 * touched, so a page was an empty shell and the public homepage fell
		 * back to hardcoded blocks. These are what makes a page editable.
		 */
		async getPageForAdmin(id: number) {
			const page = await db.query.pages.findFirst({ where: eq(pages.id, id) });
			if (!page) return null;

			const sections = await db
				.select()
				.from(pageSections)
				.where(eq(pageSections.pageId, id))
				.orderBy(asc(pageSections.sortOrder), asc(pageSections.id));

			return { page, sections };
		},

		async saveSection(input: {
			id?: number;
			pageId: number;
			sectionType: (typeof pageSections.$inferInsert)['sectionType'];
			config?: Record<string, unknown>;
			status?: string;
			sortOrder?: number;
		}) {
			if (input.id) {
				const rows = await db
					.update(pageSections)
					.set({
						sectionType: input.sectionType,
						config: input.config ?? {},
						status: input.status || 'PUBLISHED',
						...(input.sortOrder === undefined ? {} : { sortOrder: input.sortOrder })
					})
					.where(eq(pageSections.id, input.id))
					.returning();
				return rows[0];
			}

			// A new section goes to the end rather than fighting for position 0.
			const [current] = await db
				.select({ value: max(pageSections.sortOrder) })
				.from(pageSections)
				.where(eq(pageSections.pageId, input.pageId));

			const rows = await db
				.insert(pageSections)
				.values({
					pageId: input.pageId,
					sectionType: input.sectionType,
					config: input.config ?? {},
					status: input.status || 'PUBLISHED',
					sortOrder: input.sortOrder ?? (current?.value ?? 0) + 10
				})
				.returning();
			return rows[0];
		},

		/** Publish or unpublish one section without touching its config. */
		async setSectionStatus(id: number, status: 'PUBLISHED' | 'DRAFT') {
			await db.update(pageSections).set({ status }).where(eq(pageSections.id, id));
		},

		async deleteSection(id: number) {
			await db.delete(pageSections).where(eq(pageSections.id, id));
		},

		/**
		 * Moves one section up or down among its siblings by swapping sort
		 * orders, so staff never have to reason about the numbers.
		 */
		async moveSection(id: number, direction: 'up' | 'down') {
			const section = await db.query.pageSections.findFirst({ where: eq(pageSections.id, id) });
			if (!section) return;

			const siblings = await db
				.select()
				.from(pageSections)
				.where(eq(pageSections.pageId, section.pageId))
				.orderBy(asc(pageSections.sortOrder), asc(pageSections.id));

			const index = siblings.findIndex((s) => s.id === id);
			const swapWith = direction === 'up' ? siblings[index - 1] : siblings[index + 1];
			if (!swapWith) return;

			await db
				.update(pageSections)
				.set({ sortOrder: swapWith.sortOrder })
				.where(eq(pageSections.id, section.id));
			await db
				.update(pageSections)
				.set({ sortOrder: section.sortOrder })
				.where(eq(pageSections.id, swapWith.id));
		},

		async savePage(input: { id?: number; title: string; slug: string; status?: string }) {
			const values = {
				title: input.title,
				slug: input.slug,
				status: input.status || 'PUBLISHED'
			};

			if (input.id) {
				const rows = await db.update(pages).set(values).where(eq(pages.id, input.id)).returning();
				return rows[0];
			} else {
				const rows = await db.insert(pages).values(values).returning();
				return rows[0];
			}
		},

		async deletePage(id: number) {
			await db.delete(pages).where(eq(pages.id, id));
		}
	};
}

