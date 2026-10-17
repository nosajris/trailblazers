import { error } from '@sveltejs/kit';
import { services } from '$lib/server/services';
import { ogImageUrl } from '@trailblazers/core';
import type { PageServerLoad } from './$types';
import { cacheHeaders } from '$lib/server/cache';

/**
 * One message.
 *
 * Every sermon row has carried a unique slug from the start and nothing public
 * ever used it: messages played in a modal on /watch, so none of them could be
 * shared, bookmarked or indexed.
 */
export const load: PageServerLoad = async ({ params, setHeaders, url }) => {
	setHeaders(cacheHeaders('content'));

	const [settings, message] = await Promise.all([
		services.settings.getBundle(),
		services.sermons.getMessagePage(params.slug)
	]);

	if (!message) error(404, 'We could not find that message.');

	// See events/[id]/+page.server.ts for why this is conditional on both.
	const ogImage =
		!message.thumbnailUrl && process.env.SECRET_KEY
			? ogImageUrl(url.origin, process.env.SECRET_KEY, { title: message.title, kicker: 'Sermon' })
			: null;

	return { settings, message, ogImage };
};
