import { services } from '$lib/server/services';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { cacheHeaders } from '$lib/server/cache';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders(cacheHeaders('static'));

	const settings = await services.settings.getBundle();
	const u = settings.siteExtras.givingUrl?.trim();
	if (u && /^https?:\/\//i.test(u)) {
		throw redirect(302, u);
	}
	return { settings };
};
