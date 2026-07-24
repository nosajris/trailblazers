import { and, asc, desc, eq, gt, ilike, or, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { events } from './schema.js';
import type { EventListingFilters } from './types.js';

export function buildListingWhere(filters: Pick<EventListingFilters, 'search' | 'type'>): SQL | undefined {
	const parts: SQL[] = [];
	if (filters.search) {
		parts.push(
			or(ilike(events.title, `%${filters.search}%`), ilike(events.description, `%${filters.search}%`))!
		);
	}
	if (filters.type && filters.type !== 'ALL') {
		parts.push(eq(events.type, filters.type as 'CAMP' | 'WORKSHOP' | 'MEETUP'));
	}
	return parts.length ? and(...parts) : undefined;
}

export function listingOrderBy(sort: string) {
	switch (sort) {
		case 'date_desc':
			return desc(events.date);
		case 'title_asc':
			return asc(events.title);
		case 'date_asc':
		default:
			return asc(events.date);
	}
}

export function countSql() {
	return sql<number>`cast(count(*) as int)`;
}

export function publishedEventsOnly(): SQL {
	return eq(events.status, 'PUBLISHED');
}

export function upcomingFromNow(): SQL {
	return gt(events.date, new Date());
}
