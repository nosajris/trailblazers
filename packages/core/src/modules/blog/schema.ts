import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { users } from '../iam/schema.js';

export const blogs = pgTable(
	'blogs',
	{
		id: serial('id').primaryKey(),
		title: text('title').notNull(),
		category: text('category'),
		summary: text('summary').notNull(),
		content: text('content'),
		imageUrl: text('image_url'),
		authorId: integer('author_id').references(() => users.id),
		status: text('status').notNull().default('PUBLISHED'),
		sortOrder: integer('sort_order').default(0),
		publishedAt: timestamp('published_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(table) => [
		// Covers `WHERE status = 'PUBLISHED' ORDER BY created_at DESC` (listLatest / listPublished)
		index('blogs_status_created_at_idx').on(table.status, table.createdAt),
		index('blogs_author_id_idx').on(table.authorId)
	]
);

export const blogsRelations = relations(blogs, ({ one }) => ({
	author: one(users, { fields: [blogs.authorId], references: [users.id] })
}));
