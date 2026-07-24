import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const rows = await services.events.getAllEventsForAdmin();
	return { events: rows };
};

export const actions: Actions = {
	saveEvent: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') ? Number(form.get('id')) : undefined;
		const title = form.get('title')?.toString().trim();
		const description = form.get('description')?.toString().trim();
		const location = form.get('location')?.toString().trim();
		const dateStr = form.get('date')?.toString().trim();
		const type = (form.get('type')?.toString() || 'MEETUP') as 'CAMP' | 'WORKSHOP' | 'MEETUP';
		const isFeatured = form.get('isFeatured') === 'on' || form.get('isFeatured') === 'true';

		if (!title || !location || !dateStr) {
			return fail(400, { error: 'Title, location, and date are required' });
		}

		const saved = await services.events.saveEvent({
			id,
			title,
			description: description || '',
			location,
			date: new Date(dateStr),
			type,
			isFeatured
		});

		await services.auditLogs.logAction(
			id ? 'UPDATE_EVENT' : 'CREATE_EVENT',
			'EVENT',
			String(saved.id),
			`Saved event: ${saved.title}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	deleteEvent: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (id) {
			await services.events.deleteEvent(id);
			await services.auditLogs.logAction('DELETE_EVENT', 'EVENT', String(id), `Deleted event ID: ${id}`, locals.user?.id, locals.user?.fullName);
		}
		return { success: true };
	},

	exportCsv: async () => {
		const allEvents = await services.events.getAllEventsForAdmin();
		const csvContent = services.export.arrayToCsv(allEvents);
		return { csv: csvContent };
	}
};
