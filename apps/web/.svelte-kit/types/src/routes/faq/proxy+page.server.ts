// @ts-nocheck
import { services } from '$lib/server/services';
import type { PageServerLoad } from './$types';

export const load = async () => {
	const [settings, items] = await Promise.all([
		services.settings.getBundle(),
		services.faq.listPublished()
	]);
	return { settings, items };
};
;null as any as PageServerLoad;