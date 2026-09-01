import {
	pgEnum,
	pgTable,
	serial,
	text,
	integer,
	index,
	timestamp,
	uniqueIndex
} from 'drizzle-orm/pg-core';

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

/**
 * Someone asking to join a group.
 *
 * Groups were browse-only: a visitor could read about a group and had no way
 * to say they were interested, so the page was a dead end. A leader picks these
 * up from the staff portal.
 */
export const groupInterests = pgTable(
	'group_interests',
	{
		id: serial('id').primaryKey(),
		groupId: integer('group_id')
			.references(() => groups.id, { onDelete: 'cascade' })
			.notNull(),
		fullName: text('full_name').notNull(),
		email: text('email').notNull(),
		phone: text('phone'),
		message: text('message'),
		/** NEW, CONTACTED or JOINED. */
		status: text('status').notNull().default('NEW'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		// Asking twice updates the same row rather than queueing a leader twice.
		uniqueIndex('group_interests_group_email_idx').on(table.groupId, table.email),
		index('group_interests_status_created_idx').on(table.status, table.createdAt)
	]
);
