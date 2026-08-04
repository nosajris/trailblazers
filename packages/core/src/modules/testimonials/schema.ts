import { pgTable, serial, text, timestamp, integer, boolean, index } from 'drizzle-orm/pg-core';

export const testimonials = pgTable(
	'testimonials',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		role: text('role'),
		content: text('content').notNull(),
		rating: integer('rating').default(5),
		isFeatured: boolean('is_featured').default(false),
		status: text('status').notNull().default('PUBLISHED'),
		sortOrder: integer('sort_order').default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(table) => [index('testimonials_status_sort_idx').on(table.status, table.sortOrder)]
);
