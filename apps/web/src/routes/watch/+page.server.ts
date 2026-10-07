import { services } from '$lib/server/services';
import type { PageServerLoad } from './$types';
import { cacheHeaders } from '$lib/server/cache';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders(cacheHeaders('content'));

	// Cards rather than rows: the raw sermon row carries staff-only notes and the
	// discussion guide, and this page shipped all of it to every visitor.
	const [settings, sermons, featured] = await Promise.all([
		services.settings.getBundle(),
		services.sermons.listCards(),
		services.sermons.getLatestCard()
	]);

	return {
		settings,
		sermons,
		featuredSermon: featured
	};
};
