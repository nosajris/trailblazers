import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
    const eventId = Number(params.id);

    if (isNaN(eventId)) {
        throw error(404, 'Invalid event ID');
    }

    const event = await db.query.events.findFirst({
        where: eq(events.id, eventId)
    });

    if (!event) {
        throw error(404, 'Event not found');
    }

    return {
        event
    };
};