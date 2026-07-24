// @ts-nocheck
import type { PageServerLoad } from './$types';
import { services } from '$lib/server/services.js';

export const load = async () => {
	const posts = await services.blog.listPublished();
	return { posts };
};
;null as any as PageServerLoad;