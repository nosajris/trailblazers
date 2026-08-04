import { and, asc, eq } from 'drizzle-orm';
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

		async getAllPagesForAdmin() {
			return db.select().from(pages);
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

