import { pgTable, serial, text, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core';
import { users } from '../iam/schema.js';

/**
 * Prayer requests.
 *
 * Handle with more care than any other table here. A request can name a
 * medical diagnosis, a bereavement, a marriage in trouble, or an immigration
 * problem — health and family data that people share with a church expecting
 * pastoral confidence, not a database row anyone on staff can browse.
 *
 * Hence:
 *  - `isPrivate` defaults to true. Sharing is opt-in, never assumed.
 *  - `isAnonymous` lets someone submit without attaching their name.
 *  - `sharedPublicly` is a second, separate flag: a request marked shareable is
 *    still not published until a human decides to publish it.
 */
export const prayerRequests = pgTable(
	'prayer_requests',
	{
		id: serial('id').primaryKey(),
		/** Null when submitted anonymously. */
		fullName: text('full_name'),
		/** Optional: someone may want prayer without a follow-up conversation. */
		email: text('email'),
		phone: text('phone'),
		request: text('request').notNull(),
		/** True unless the person explicitly allows it to be shared with a team. */
		isPrivate: boolean('is_private').notNull().default(true),
		isAnonymous: boolean('is_anonymous').notNull().default(false),
		/** Set only by staff, and only for a request that is not private. */
		sharedPublicly: boolean('shared_publicly').notNull().default(false),
		/** NEW, PRAYING, FOLLOWED_UP or CLOSED. */
		status: text('status').notNull().default('NEW'),
		/** Staff notes. Never shown to the person who submitted. */
		staffNotes: text('staff_notes'),
		assignedToUserId: integer('assigned_to_user_id').references(() => users.id, {
			onDelete: 'set null'
		}),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('prayer_requests_status_created_idx').on(table.status, table.createdAt),
		index('prayer_requests_assigned_idx').on(table.assignedToUserId)
	]
);
