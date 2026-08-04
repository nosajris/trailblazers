import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const posts = await services.blog.getAllForAdmin();
	return { posts };
};

export const actions: Actions = {
	savePost: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') ? Number(form.get('id')) : undefined;
		const title = form.get('title')?.toString().trim();
		const category = form.get('category')?.toString().trim();
		const summary = form.get('summary')?.toString().trim();
		const content = form.get('content')?.toString().trim();
		const imageUrl = form.get('imageUrl')?.toString().trim();
		const status = form.get('status')?.toString().trim() || 'PUBLISHED';

		if (!title || !summary) {
			return fail(400, { error: 'Story title and summary are required' });
		}

		const saved = await services.blog.savePost({
			id,
			title,
			category: category || 'Story',
			summary,
			content,
			imageUrl,
			status
		});

		await services.auditLogs.logAction(
			id ? 'UPDATE_STORY' : 'CREATE_STORY',
			'BLOG',
			String(saved.id),
			`Saved story/article: ${saved.title}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	deletePost: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (id) {
			await services.blog.deletePost(id);
			await services.auditLogs.logAction(
				'DELETE_STORY',
				'BLOG',
				String(id),
				`Deleted story ID: ${id}`,
				locals.user?.id,
				locals.user?.fullName
			);
		}
		return { success: true };
	}
};

