import { services } from '$lib/server/services';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	settings: await services.settings.getBundle()
});
