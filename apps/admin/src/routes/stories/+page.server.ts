import type { PageServerLoad } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const posts = await services.blog.listPublished();
	return { posts };
};
