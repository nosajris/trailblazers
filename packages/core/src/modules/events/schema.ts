import {
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	boolean,
	integer,
	index,
	uniqueIndex
} from 'drizzle-orm/pg-core';

export const eventTypeEnum = pgEnum('event_type', ['CAMP', 'WORKSHOP', 'MEETUP']);

export const events = pgTable(
	'events',
	{
		id: serial('id').primaryKey(),
		title: text('title').notNull(),
		description: text('description').notNull(),
		date: timestamp('date', { withTimezone: true }).notNull(),
		location: text('location').notNull(),
		imageUrl: text('image_url'),
		type: eventTypeEnum('type').notNull(),
		price: integer('price').default(0),
		earlyBirdDeadline: timestamp('early_bird_deadline', { withTimezone: true }),
		capacity: integer('capacity'),
		registeredCount: integer('registered_count').default(0),
		isFeatured: boolean('is_featured').default(false),
		status: text('status').notNull().default('PUBLISHED'),
		sortOrder: integer('sort_order').default(0),
		publishedAt: timestamp('published_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(table) => [
		// Covers `WHERE status = 'PUBLISHED' AND date > now() ORDER BY date` (home rail + listing pages)
		index('events_status_date_idx').on(table.status, table.date),
		index('events_status_featured_idx').on(table.status, table.isFeatured)
	]
);

/**
 * Event registrations.
 *
 * `events.capacity` and `registeredCount` existed as columns but nothing ever
 * wrote to them — there was no way for anyone to say they were coming. The
 * unique constraint on (event, email) is what makes a double submission
 * idempotent rather than creating two seats for one person.
 */
export const eventRegistrations = pgTable(
	'event_registrations',
	{
		id: serial('id').primaryKey(),
		eventId: integer('event_id')
			.references(() => events.id, { onDelete: 'cascade' })
			.notNull(),
		fullName: text('full_name').notNull(),
		email: text('email').notNull(),
		phone: text('phone'),
		/** CONFIRMED, WAITLIST or CANCELLED. */
		status: text('status').notNull().default('CONFIRMED'),
		notes: text('notes'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		// One seat per person per event.
		uniqueIndex('event_registrations_event_email_idx').on(table.eventId, table.email),
		// Serves the confirmed-seat count that capacity is checked against.
		index('event_registrations_event_status_idx').on(table.eventId, table.status)
	]
);
