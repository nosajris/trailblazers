import { services } from '$lib/server/services';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const settings = await services.settings.getBundle();
	const u = settings.siteExtras.givingUrl?.trim();
	if (u && /^https?:\/\//i.test(u)) {
		throw redirect(302, u);
	}
	return { settings };
};
