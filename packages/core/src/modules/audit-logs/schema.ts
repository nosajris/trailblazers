import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from '../iam/schema.js';

export const auditLogs = pgTable('audit_logs', {
	id: serial('id').primaryKey(),
	userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
	userName: text('user_name').notNull().default('System / Staff'),
	action: text('action').notNull(),
	entityType: text('entity_type').notNull(),
	entityId: text('entity_id'),
	details: text('details'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
