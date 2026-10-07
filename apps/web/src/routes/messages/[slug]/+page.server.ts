import { error } from '@sveltejs/kit';
import { services } from '$lib/server/services';
import type { PageServerLoad } from './$types';
import { cacheHeaders } from '$lib/server/cache';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	setHeaders(cacheHeaders('content'));

	const [settings, page] = await Promise.all([
		services.settings.getBundle(),
		services.sermons.getSeriesPage(params.slug)
	]);

	if (!page) error(404, 'We could not find that series.');

	return { settings, series: page.series, messages: page.messages };
};
