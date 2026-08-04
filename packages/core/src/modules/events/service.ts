import { and, asc, desc, eq, gte, lt } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { events } from './schema.js';
import { toEventCard } from './mappers.js';
import {
	buildListingWhere,
	countSql,
	listingOrderBy,
	publishedEventsOnly,
	upcomingFromNow
} from './query.js';
import type { EventCardVm, EventListingFilters, EventListingResult } from './types.js';

export function createEventService(db: Database) {
	async function getFeaturedOrFallback(): Promise<EventCardVm | null> {
		let featured = await db.query.events.findFirst({
			where: and(eq(events.isFeatured, true), publishedEventsOnly())
		});
		if (!featured) {
			const fallback = await db
				.select()
				.from(events)
				.where(publishedEventsOnly())
				.orderBy(asc(events.date))
				.limit(1);
			featured = fallback[0];
		}
		return featured ? toEventCard(featured) : null;
	}

	return {
		listUpcomingForHome: async (limit = 3): Promise<EventCardVm[]> => {
			const rows = await db
				.select()
				.from(events)
				.where(and(publishedEventsOnly(), upcomingFromNow()))
				.orderBy(desc(events.isFeatured), asc(events.date))
				.limit(limit);
			return rows.map(toEventCard);
		},

		getById: async (id: number): Promise<EventCardVm | null> => {
			const row = await db.query.events.findFirst({
				where: and(eq(events.id, id), publishedEventsOnly())
			});
			return row ? toEventCard(row) : null;
		},

		getFeaturedOrFallback,

		listInMonth: async (year: number, month: number): Promise<EventCardVm[]> => {
			const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
			const end = new Date(year, month, 1, 0, 0, 0, 0);
			return (
				await db
					.select()
					.from(events)
					.where(
						and(publishedEventsOnly(), gte(events.date, start), lt(events.date, end))
					)
					.orderBy(asc(events.date))
			).map(toEventCard);
		},

		listListing: async (filters: EventListingFilters): Promise<EventListingResult> => {
			const offset = (filters.page - 1) * filters.limit;
			const whereClause = and(buildListingWhere(filters), publishedEventsOnly());
			const orderBy = listingOrderBy(filters.sort);

			// The page of results, the total count, and the featured event are three
			// independent queries — run them concurrently rather than one after another.
			const [paginatedEvents, countResult, featuredEvent] = await Promise.all([
				db.select().from(events).where(whereClause).orderBy(orderBy).limit(filters.limit).offset(offset),
				db.select({ count: countSql() }).from(events).where(whereClause),
				getFeaturedOrFallback()
			]);
			const totalEvents = countResult[0]?.count ?? 0;
			const totalPages = Math.ceil(totalEvents / filters.limit);

			return {
				events: paginatedEvents.map(toEventCard),
				featuredEvent,
				pagination: {
					currentPage: filters.page,
					totalPages,
					totalEvents
				},
				filters: {
					search: filters.search,
					type: filters.type,
					sort: filters.sort
				}
			};
		},

		getAllEventsForAdmin: async () => {
			return db.select().from(events).orderBy(desc(events.date));
		},

		saveEvent: async (data: Partial<typeof events.$inferInsert> & { title: string; date: Date; location: string }) => {
			if (data.id) {
				const rows = await db.update(events).set(data).where(eq(events.id, data.id)).returning();
				return rows[0];
			}
			const rows = await db.insert(events).values({
				title: data.title,
				description: data.description || '',
				date: data.date,
				location: data.location,
				imageUrl: data.imageUrl || null,
				type: data.type || 'MEETUP',
				price: data.price ?? 0,
				capacity: data.capacity ?? 100,
				isFeatured: data.isFeatured ?? false,
				status: data.status || 'PUBLISHED',
				publishedAt: new Date()
			}).returning();
			return rows[0];
		},

		deleteEvent: async (id: number) => {
			await db.delete(events).where(eq(events.id, id));
		}
	};
}

