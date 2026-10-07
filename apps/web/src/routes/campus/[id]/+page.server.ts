import { error } from '@sveltejs/kit';
import { services } from '$lib/server/services';
import { cacheHeaders } from '$lib/server/cache';
import type { PageServerLoad } from './$types';

/**
 * One campus.
 *
 * Site settings used to list campuses that all linked to /contact, so three
 * cities shared one page and none of them said when or where they met. Each
 * campus configured in the staff portal now has a real page; anything else
 * 404s rather than rendering an empty shell.
 */
export const load: PageServerLoad = async ({ params, setHeaders }) => {
	setHeaders(cacheHeaders('static'));

	const settings = await services.settings.getBundle();
	const campus = (settings.siteExtras.campuses ?? []).find((c) => c.id === params.id);

	if (!campus) error(404, 'We could not find that campus.');

	return { settings, campus };
};
