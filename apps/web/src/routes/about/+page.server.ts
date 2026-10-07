import { error } from '@sveltejs/kit';
import { services } from '$lib/server/services';
import { cacheHeaders } from '$lib/server/cache';
import type { PageServerLoad } from './$types';

/**
 * About, assembled in the staff portal.
 *
 * "Who are you and what do you believe" was the one question the site never
 * answered, and the answer is not something to hardcode on a church's behalf.
 * This composes whatever sections staff add to the page with the slug /about —
 * beliefs and history as rich blocks, plus the Leaders section — and 404s until
 * the page exists, so the link is never a half-built shell.
 */
export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders(cacheHeaders('static'));

	const [settings, blocks] = await Promise.all([
		services.settings.getBundle(),
		services.pages.composePublicPage('/about')
	]);

	if (blocks.length === 0) {
		error(404, 'This page has not been set up yet.');
	}

	return { settings, blocks };
};
