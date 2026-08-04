import { pgEnum, pgTable, serial, text, integer, index } from 'drizzle-orm/pg-core';

export const groupTypeEnum = pgEnum('group_type', ['CAMPUS', 'PRO', 'INTEREST', 'ONLINE']);

export const groups = pgTable(
	'groups',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		leader: text('leader').notNull(),
		dayTime: text('day_time').notNull(),
		type: groupTypeEnum('type').notNull(),
		imageUrl: text('image_url'),
		description: text('description'),
		status: text('status').notNull().default('PUBLISHED'),
		sortOrder: integer('sort_order').default(0)
	},
	(table) => [index('groups_status_sort_idx').on(table.status, table.sortOrder)]
);
