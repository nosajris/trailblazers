import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from '../iam/schema.js';

export const blogs = pgTable('blogs', {
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
});

export const blogsRelations = relations(blogs, ({ one }) => ({
	author: one(users, { fields: [blogs.authorId], references: [users.id] })
}));
