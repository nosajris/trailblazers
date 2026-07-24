// @ts-nocheck
import { services } from '$lib/server/services';
import type { PageServerLoad } from './$types';

export const load = async () => ({
	settings: await services.settings.getBundle()
});
;null as any as PageServerLoad;