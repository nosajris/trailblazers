import { services } from '$lib/server/services';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [settings, posts] = await Promise.all([
		services.settings.getBundle(),
		services.blog.listPublished(48)
	]);
	return { settings, posts };
};
