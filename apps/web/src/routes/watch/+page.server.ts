import { services } from '$lib/server/services';
import type { PageServerLoad } from './$types';
import { cacheHeaders } from '$lib/server/cache';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders(cacheHeaders('content'));

	const [settings, sermons, featured] = await Promise.all([
		services.settings.getBundle(),
		services.sermons.getAllSermons(),
		services.sermons.getFeaturedSermon()
	]);

	return {
		settings,
		sermons,
		featuredSermon: featured
	};
};
