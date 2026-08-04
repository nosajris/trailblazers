import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const pagesList = await services.pages.getAllPagesForAdmin();
	return { pages: pagesList };
};

export const actions: Actions = {
	savePage: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') ? Number(form.get('id')) : undefined;
		const title = form.get('title')?.toString().trim();
		const slug = form.get('slug')?.toString().trim();
		const status = form.get('status')?.toString().trim() || 'PUBLISHED';

		if (!title || !slug) {
			return fail(400, { error: 'Title and URL slug are required' });
		}

		const saved = await services.pages.savePage({ id, title, slug, status });
		await services.auditLogs.logAction(
			id ? 'UPDATE_PAGE' : 'CREATE_PAGE',
			'PAGE',
			String(saved.id),
			`Saved CMS page: ${saved.title} (/${saved.slug})`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	deletePage: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (id) {
			await services.pages.deletePage(id);
			await services.auditLogs.logAction(
				'DELETE_PAGE',
				'PAGE',
				String(id),
				`Deleted page ID: ${id}`,
				locals.user?.id,
				locals.user?.fullName
			);
		}
		return { success: true };
	}
};
