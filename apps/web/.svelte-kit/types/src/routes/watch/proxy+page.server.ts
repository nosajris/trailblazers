// @ts-nocheck
import { services } from '$lib/server/services';
import type { PageServerLoad } from './$types';

export const load = async () => {
	const [settings, sermons, featured] = await Promise.all([
		services.settings.getBundle(),
		services.sermons.getAllSermons(),
		services.sermons.getFeaturedSermon()
	]);

	return {
		settings,
		sermons,
		featuredSermon: featured
	};
};
;null as any as PageServerLoad;