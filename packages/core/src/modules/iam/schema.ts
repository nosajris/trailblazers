import { relations } from 'drizzle-orm';
import { pgEnum, index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

/** Must match Postgres enum `user_role` (migration adds SECRETARY). */
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'SECRETARY', 'LEADER', 'MEMBER']);

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	fullName: text('full_name').notNull(),
	role: userRoleEnum('role').default('MEMBER'),
	avatarUrl: text('avatar_url'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const sessions = pgTable(
	'sessions',
	{
		id: text('id').primaryKey(),
		userId: integer('user_id')
			.references(() => users.id, { onDelete: 'cascade' })
			.notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
	},
	(table) => [
		index('sessions_user_id_idx').on(table.userId),
		// Supports a periodic cleanup job (`DELETE FROM sessions WHERE expires_at < now()`)
		index('sessions_expires_at_idx').on(table.expiresAt)
	]
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] })
}));
