import { pgEnum, pgTable, serial, text, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core';

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
