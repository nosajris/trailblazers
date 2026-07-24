import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { desc, asc, ilike, eq, and, sql, or } from 'drizzle-orm';

export const load = async ({ url }) => {
    // 1. Parse Query Parameters
    const search = url.searchParams.get('q') || '';
    const type = url.searchParams.get('type') || 'ALL';
    const sort = url.searchParams.get('sort') || 'date_asc';
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;

    // 2. Build Filter Conditions
    const filters = [];
    
    if (search) {
        filters.push(or(
            ilike(events.title, `%${search}%`),
            ilike(events.description, `%${search}%`)
        ));
    }

    // Handle Enum Type Casting
    if (type !== 'ALL') {
        // Drizzle/Postgres usually handles string-to-enum comparison automatically
        // provided the string matches one of the enum values.
        // We cast 'type' to any to bypass strict TS checking against the specific enum values for this generic filter logic
        filters.push(eq(events.type, type as any));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // 3. Determine Sort Order
    let orderBy;
    switch (sort) {
        case 'date_desc':
            orderBy = desc(events.date);
            break;
        case 'title_asc':
            orderBy = asc(events.title);
            break;
        case 'date_asc':
        default:
            orderBy = asc(events.date);
            break;
    }

    // 4. Fetch Data (Paginated)
    const paginatedEvents = await db.select()
        .from(events)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

    // 5. Get Total Count
    const countResult = await db.select({ count: sql<number>`cast(count(*) as int)` })
        .from(events)
        .where(whereClause);
        
    const totalEvents = countResult[0].count;
    const totalPages = Math.ceil(totalEvents / limit);

    // 6. Fetch Featured Event
    let featuredEvent = await db.query.events.findFirst({
        where: eq(events.isFeatured, true)
    });

    if (!featuredEvent) {
        const fallback = await db.select().from(events).orderBy(asc(events.date)).limit(1);
        featuredEvent = fallback[0];
    }

    return {
        events: paginatedEvents,
        featuredEvent,
        pagination: {
            currentPage: page,
            totalPages,
            totalEvents
        },
        filters: {
            search,
            type,
            sort
        }
    };
};