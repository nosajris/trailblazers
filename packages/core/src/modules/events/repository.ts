/**
 * Data access for events. Drizzle calls only — no business rules.
 *
 * `.agents/rules/code-style.md` mandates Repository -> Service -> Controller,
 * but only three of twenty-two modules had a repository; the rest called
 * Drizzle from the service. This module is the reference implementation of the
 * rule for the others to follow.
 */

import { and, asc, count, desc, eq, gte, lt } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { events } from './schema.js';
import { countSql, listingOrderBy, publishedEventsOnly, upcomingFromNow } from './query.js';
import type { EventListingFilters } from './types.js';

export type EventRow = typeof events.$inferSelect;
export type EventInsert = typeof events.$inferInsert;

export function createEventRepository(db: Database) {
	return {
		findById(id: number) {
			return db.query.events.findFirst({ where: eq(events.id, id) });
		},

		findPublishedById(id: number) {
			return db.query.events.findFirst({
				where: and(eq(events.id, id), publishedEventsOnly())
			});
		},

		findFeatured() {
			return db.query.events.findFirst({
				where: and(eq(events.isFeatured, true), publishedEventsOnly())
			});
		},

		findEarliestPublished(limit = 1) {
			return db
				.select()
				.from(events)
				.where(publishedEventsOnly())
				.orderBy(asc(events.date))
				.limit(limit);
		},

		listUpcoming(limit: number) {
			return db
				.select()
				.from(events)
				.where(and(publishedEventsOnly(), upcomingFromNow()))
				.orderBy(desc(events.isFeatured), asc(events.date))
				.limit(limit);
		},

		listInRange(start: Date, end: Date) {
			return db
				.select()
				.from(events)
				.where(and(publishedEventsOnly(), gte(events.date, start), lt(events.date, end)))
				.orderBy(asc(events.date));
		},

		listPage(whereClause: ReturnType<typeof and>, filters: EventListingFilters, offset: number) {
			return db
				.select()
				.from(events)
				.where(whereClause)
				.orderBy(listingOrderBy(filters.sort))
				.limit(filters.limit)
				.offset(offset);
		},

		countMatching(whereClause: ReturnType<typeof and>) {
			return db.select({ count: countSql() }).from(events).where(whereClause);
		},

		listAll() {
			return db.select().from(events).orderBy(desc(events.date));
		},

		/** One page of the admin list, newest first. */
		listForAdminPage(limit: number, offset: number) {
			return db.select().from(events).orderBy(desc(events.date)).limit(limit).offset(offset);
		},

		/** Total rows, for the pager. */
		countAll() {
			return db.select({ value: count() }).from(events);
		},

		async insert(values: EventInsert): Promise<EventRow> {
			const rows = await db.insert(events).values(values).returning();
			return rows[0];
		},

		async update(id: number, values: Partial<EventInsert>): Promise<EventRow | undefined> {
			const rows = await db.update(events).set(values).where(eq(events.id, id)).returning();
			return rows[0];
		},

		async delete(id: number): Promise<void> {
			await db.delete(events).where(eq(events.id, id));
		}
	};
}

export type EventRepository = ReturnType<typeof createEventRepository>;
