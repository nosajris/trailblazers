import { services } from '$lib/server/services';
import type { PageServerLoad } from './$types';
import { cacheHeaders } from '$lib/server/cache';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders(cacheHeaders('content'));
	return { settings: await services.settings.getBundle() };
};
