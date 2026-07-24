import { services } from '$lib/server/services';
import { buildGoogleCalendarIcs } from '$lib/ics';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
	const eventId = Number(params.id);
	if (Number.isNaN(eventId)) throw error(400, 'Invalid id');

	const event = await services.events.getById(eventId);
	if (!event) throw error(404, 'Not found');

	const ics = buildGoogleCalendarIcs({
		id: event.id,
		title: event.title,
		description: event.description,
		location: event.location,
		start: new Date(event.date),
		siteUrl: url.origin
	});

	return new Response(ics, {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': `attachment; filename="trailblazers-event-${event.id}.ics"`
		}
	});
};
