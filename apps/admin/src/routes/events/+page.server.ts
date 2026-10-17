import { fail } from '@sveltejs/kit';
import { deleteEventSchema, saveEventSchema, readPageRequest } from '@trailblazers/core';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';
import { handleAction } from '$lib/server/actions.js';
import { requireSection } from '$lib/server/auth.js';

/**
 * Reference controller.
 *
 * Compare against the other admin routes: this one declares a section, a
 * schema, what to do and what to audit. Parsing, validation, sanitization,
 * authorization, error handling and the audit entry all live in
 * `handleAction`, so they cannot drift or be forgotten here.
 */

export const load: PageServerLoad = async ({ locals, url, setHeaders }) => {
	requireSection(locals.user, 'content');

	// Paged, not the whole table. `?page` and `?pageSize` are clamped by
	// readPageRequest, so a hand-edited URL cannot ask for a million rows.
	const page = await services.events.listForAdmin(readPageRequest(url.searchParams));

	setHeaders({ 'cache-control': 'private, no-store' });

	return { events: page.items, pagination: page };
};

export const actions: Actions = {
	saveEvent: (event) =>
		handleAction(event, {
			section: 'content',
			module: 'AdminEvents',
			schema: saveEventSchema,
			perform: (data) => services.events.saveEvent(data),
			audit: (data, saved) => ({
				action: data.id ? 'UPDATE_EVENT' : 'CREATE_EVENT',
				entityType: 'EVENT',
				entityId: saved.id,
				details: `Saved event: ${saved.title}`
			})
		}),

	deleteEvent: (event) =>
		handleAction(event, {
			section: 'content',
			module: 'AdminEvents',
			schema: deleteEventSchema,
			perform: (data) => services.events.deleteEvent(data.id),
			audit: (data) => ({
				action: 'DELETE_EVENT',
				entityType: 'EVENT',
				entityId: data.id,
				details: `Deleted event ID: ${data.id}`
			})
		}),

	exportCsv: async ({ locals }) => {
		requireSection(locals.user, 'content');
		const allEvents = await services.events.getAllEventsForAdmin();
		return { csv: services.export.arrayToCsv(allEvents) };
	},

	/**
	 * Staff upload for an event's cover image. Same shape as the other
	 * `uploadImage` actions in this app — the client sets the returned URL
	 * into the modal's own field rather than this action touching the
	 * event record.
	 */
	uploadImage: async ({ request, locals }) => {
		requireSection(locals.user, 'content');

		const form = await request.formData();
		const file = form.get('file');
		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { error: 'Choose an image to upload.' });
		}

		try {
			const buffer = Buffer.from(await file.arrayBuffer());
			const asset = await services.media.upload(
				{ buffer, mimeType: file.type, size: file.size },
				locals.user?.id
			);
			return { success: true, uploadedUrl: asset.url };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'That upload failed.';
			return fail(400, { error: message });
		}
	}
};
