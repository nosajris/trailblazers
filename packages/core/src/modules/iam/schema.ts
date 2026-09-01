import { relations } from 'drizzle-orm';
import {
	pgEnum,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp
} from 'drizzle-orm/pg-core';

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
		/**
		 * HMAC-SHA256 of the token held in the cookie, keyed by SECRET_KEY.
		 * The raw token is never stored, so this column cannot be replayed.
		 */
		id: text('id').primaryKey(),
		userId: integer('user_id')
			.references(() => users.id, { onDelete: 'cascade' })
			.notNull(),
		/** Fixed point of origin, enforcing an absolute maximum session age. */
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		/** Slides forward on use, clamped to createdAt + the absolute ceiling. */
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
	},
	(table) => [
		index('sessions_user_id_idx').on(table.userId),
		// Supports the cleanup sweep (`DELETE FROM sessions WHERE expires_at < now()`)
		index('sessions_expires_at_idx').on(table.expiresAt)
	]
);

/**
 * Single-use tokens for setting a password: an invite for a newly created
 * account, or a reset for an existing one.
 *
 * Only the HMAC of the token is stored, for the same reason as sessions.
 */
export const passwordTokens = pgTable(
	'password_tokens',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.references(() => users.id, { onDelete: 'cascade' })
			.notNull(),
		tokenHash: text('token_hash').notNull().unique(),
		/** 'INVITE' for a new account, 'RESET' for an existing one. */
		purpose: text('purpose').notNull().default('INVITE'),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		usedAt: timestamp('used_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('password_tokens_user_id_idx').on(table.userId),
		index('password_tokens_expires_at_idx').on(table.expiresAt)
	]
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] })
}));
