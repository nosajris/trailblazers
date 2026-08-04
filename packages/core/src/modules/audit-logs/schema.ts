import { pgTable, serial, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { users } from '../iam/schema.js';

export const auditLogs = pgTable(
	'audit_logs',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
		userName: text('user_name').notNull().default('System / Staff'),
		action: text('action').notNull(),
		entityType: text('entity_type').notNull(),
		entityId: text('entity_id'),
		details: text('details'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		// findAll() orders by created_at DESC on every admin dashboard load
		index('audit_logs_created_at_idx').on(table.createdAt),
		index('audit_logs_user_id_idx').on(table.userId)
	]
);
