import { pgTable, serial, text, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core';
import { users } from '../iam/schema.js';

export const tasks = pgTable(
	'tasks',
	{
		id: serial('id').primaryKey(),
		title: text('title').notNull(),
		description: text('description'),
		assignedToUserId: integer('assigned_to_user_id').references(() => users.id, { onDelete: 'set null' }),
		relatedEntityType: text('related_entity_type'),
		relatedEntityId: text('related_entity_id'),
		isCompleted: boolean('is_completed').default(false).notNull(),
		dueDate: timestamp('due_date', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('tasks_created_at_idx').on(table.createdAt),
		index('tasks_assigned_to_user_id_idx').on(table.assignedToUserId)
	]
);
