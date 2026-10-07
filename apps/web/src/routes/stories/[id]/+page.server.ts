import { services } from '$lib/server/services';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { cacheHeaders } from '$lib/server/cache';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	setHeaders(cacheHeaders('content'));

	const id = Number(params.id);
	if (Number.isNaN(id)) throw error(404, 'Not found');

	const [post, settings, latest] = await Promise.all([
		services.blog.getPublishedPost(id),
		services.settings.getBundle(),
		services.blog.listLatest(4)
	]);

	if (!post) throw error(404, 'Not found');

	// A story used to be a dead end: no way to share it and nothing to read next.
	const more = latest.filter((item) => item.id !== post.id).slice(0, 3);

	return { post, settings, more };
};
