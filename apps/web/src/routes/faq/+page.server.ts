import { services } from '$lib/server/services';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [settings, items] = await Promise.all([
		services.settings.getBundle(),
		services.faq.listPublished()
	]);
	return { settings, items };
};
