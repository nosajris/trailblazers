import { services } from '$lib/server/services';
import type { PageServerLoad } from './$types';
import { cacheHeaders } from '$lib/server/cache';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders(cacheHeaders('content'));

	const [settings, series, latest] = await Promise.all([
		services.settings.getBundle(),
		services.sermons.listSeriesCards(),
		services.sermons.getLatestCard()
	]);

	return { settings, series, latest };
};
