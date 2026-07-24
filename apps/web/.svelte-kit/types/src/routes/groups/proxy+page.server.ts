// @ts-nocheck
import { services } from '$lib/server/services';
import type { PageServerLoad } from './$types';

export const load = async () => {
	const [settings, groups] = await Promise.all([
		services.settings.getBundle(),
		services.groups.listPublished()
	]);
	return { settings, groups };
};
;null as any as PageServerLoad;