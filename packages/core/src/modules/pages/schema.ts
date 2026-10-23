import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp
} from 'drizzle-orm/pg-core';

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
	'FORM',
	'CUSTOM'
]);

export const pages = pgTable('pages', {
	id: serial('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	status: text('status').notNull().default('PUBLISHED'),
	/**
	 * When staff asked for this page to go live. The daily cron publishes it
	 * once the time has passed and clears this, so a value here always means
	 * "still waiting".
	 */
	publishAt: timestamp('publish_at', { withTimezone: true }),
	/** Last time a publish ran for this page. Null if it never has. */
	publishedAt: timestamp('published_at', { withTimezone: true })
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
		/**
		 * What visitors see. Only ever written by a publish — the editor writes
		 * `draftConfig`, so autosaving a headline no longer rewrites the live
		 * page as staff type.
		 */
		config: jsonb('config').$type<Record<string, unknown>>().notNull().default({}),
		/** Unpublished edits. Null when the section has none waiting. */
		draftConfig: jsonb('draft_config').$type<Record<string, unknown>>(),
		/** Unpublished position. Null when the section has not been moved. */
		draftSortOrder: integer('draft_sort_order'),
		/** Null until the section has been published once. */
		publishedAt: timestamp('published_at', { withTimezone: true }),
		/**
		 * Marked for removal on the next publish. The row stays, and the section
		 * keeps rendering publicly, until that publish runs — otherwise deleting
		 * would be the one edit that went live immediately.
		 */
		pendingDelete: boolean('pending_delete').notNull().default(false),
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
