import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

export const leaders = pgTable('leaders', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	role: text('role').notNull(),
	imageUrl: text('image_url'),
	order: integer('order').default(0),
	status: text('status').notNull().default('PUBLISHED')
});
