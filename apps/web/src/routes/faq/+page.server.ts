import { services } from '$lib/server/services';
import type { PageServerLoad } from './$types';
import { cacheHeaders } from '$lib/server/cache';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders(cacheHeaders('content'));

	const [settings, items] = await Promise.all([
		services.settings.getBundle(),
		services.faq.listPublished()
	]);
	return { settings, items };
};
