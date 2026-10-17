import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { services } from '$lib/server/services.js';
import { requireSection } from '$lib/server/auth.js';

/**
 * Recent CMS uploads, for the staff media picker. Any signed-in staff
 * member who can edit content may browse this list — it is reused across
 * every image field (hero backgrounds, leader avatars, story covers, event
 * covers), not scoped to one of them.
 */
export const GET: RequestHandler = async ({ locals }) => {
	requireSection(locals.user, 'content');

	const assets = await services.media.listRecent(24);
	return json({ assets });
};
