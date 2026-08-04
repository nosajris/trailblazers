import { relations } from 'drizzle-orm';
import { index, integer, jsonb, pgEnum, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const pageSectionTypeEnum = pgEnum('page_section_type', [
	'HERO',
	'EVENTS_RAIL',
	'BLOG',
	'TESTIMONIALS',
	'GROUPS',
	'SERVE',
	'LEADERS',
	'IM_NEW',
	'PARENTS',
	'FAQ',
	'CONTACT',
	'CUSTOM'
]);

export const pages = pgTable('pages', {
	id: serial('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	status: text('status').notNull().default('PUBLISHED')
});

export const pageSections = pgTable(
	'page_sections',
	{
		id: serial('id').primaryKey(),
		pageId: integer('page_id')
			.references(() => pages.id, { onDelete: 'cascade' })
			.notNull(),
		sectionType: pageSectionTypeEnum('section_type').notNull(),
		sortOrder: integer('sort_order').notNull().default(0),
		status: text('status').notNull().default('PUBLISHED'),
		config: jsonb('config').$type<Record<string, unknown>>().notNull().default({}),
		refId: integer('ref_id')
	},
	(table) => [
		// Covers composePublicPage's `WHERE page_id = ? AND status = 'PUBLISHED' ORDER BY sort_order` — the hot path for every page render
		index('page_sections_page_status_sort_idx').on(table.pageId, table.status, table.sortOrder)
	]
);

export const pagesRelations = relations(pages, ({ many }) => ({
	sections: many(pageSections)
}));

export const pageSectionsRelations = relations(pageSections, ({ one }) => ({
	page: one(pages, { fields: [pageSections.pageId], references: [pages.id] })
}));
