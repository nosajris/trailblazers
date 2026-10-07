import { error } from '@sveltejs/kit';
import { services } from '$lib/server/services';
import type { PageServerLoad } from './$types';
import { cacheHeaders } from '$lib/server/cache';

/**
 * One message.
 *
 * Every sermon row has carried a unique slug from the start and nothing public
 * ever used it: messages played in a modal on /watch, so none of them could be
 * shared, bookmarked or indexed.
 */
export const load: PageServerLoad = async ({ params, setHeaders }) => {
	setHeaders(cacheHeaders('content'));

	const [settings, message] = await Promise.all([
		services.settings.getBundle(),
		services.sermons.getMessagePage(params.slug)
	]);

	if (!message) error(404, 'We could not find that message.');

	return { settings, message };
};
