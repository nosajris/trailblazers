// @ts-nocheck
import { services } from '$lib/server/services';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = async ({ params }: Parameters<PageServerLoad>[0]) => {
	const id = Number(params.id);
	if (Number.isNaN(id)) throw error(404, 'Not found');

	const [post, settings] = await Promise.all([
		services.blog.getPublishedPost(id),
		services.settings.getBundle()
	]);

	if (!post) throw error(404, 'Not found');

	return { post, settings };
};
