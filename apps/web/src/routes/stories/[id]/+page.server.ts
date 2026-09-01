import { services } from '$lib/server/services';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { cacheHeaders } from '$lib/server/cache';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	setHeaders(cacheHeaders('content'));

	const id = Number(params.id);
	if (Number.isNaN(id)) throw error(404, 'Not found');

	const [post, settings] = await Promise.all([
		services.blog.getPublishedPost(id),
		services.settings.getBundle()
	]);

	if (!post) throw error(404, 'Not found');

	return { post, settings };
};
