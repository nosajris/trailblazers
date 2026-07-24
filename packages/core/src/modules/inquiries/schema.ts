import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const inquiries = pgTable('inquiries', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull(),
	message: text('message'),
	type: text('type').default('GENERAL'),
	status: text('status').default('PENDING'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});
