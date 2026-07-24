import { services } from '$lib/server/services';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [settings, groups] = await Promise.all([
		services.settings.getBundle(),
		services.groups.listPublished()
	]);
	return { settings, groups };
};
