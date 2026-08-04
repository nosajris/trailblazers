import { pgTable, serial, text, integer, index } from 'drizzle-orm/pg-core';

export const faqs = pgTable(
	'faqs',
	{
		id: serial('id').primaryKey(),
		question: text('question').notNull(),
		answer: text('answer').notNull(),
		order: integer('order').default(0),
		status: text('status').notNull().default('PUBLISHED')
	},
	(table) => [index('faqs_status_order_idx').on(table.status, table.order)]
);
