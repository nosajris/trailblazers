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

			const blocks: HomeSectionBlock[] = [];

			for (const section of sections) {
				const loader = registry[section.sectionType] as
					| ((s: typeof section) => Promise<HomeSectionBlock | null>)
					| undefined;
				if (!loader) continue;
				const block = await loader(section);
				if (block) blocks.push(block);
			}

			return blocks;
		}
	};
}
