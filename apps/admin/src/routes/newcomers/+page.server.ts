import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const items = await services.newcomers.getAllForAdmin();
	return { items };
};

export const actions: Actions = {
	saveNewcomerContent: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') ? Number(form.get('id')) : undefined;
		const headline = form.get('headline')?.toString().trim();
		const subheadline = form.get('subheadline')?.toString().trim();
		const body = form.get('body')?.toString().trim();
		const ctaLabel = form.get('ctaLabel')?.toString().trim();
		const ctaHref = form.get('ctaHref')?.toString().trim();
		const imageUrl = form.get('imageUrl')?.toString().trim();
		const status = form.get('status')?.toString().trim() || 'PUBLISHED';
		const sortOrder = form.get('sortOrder') ? Number(form.get('sortOrder')) : 0;

		if (!headline) {
			return fail(400, { error: 'Headline is required' });
		}

		const saved = await services.newcomers.saveNewcomerContent({
			id,
			headline,
			subheadline,
			body,
			ctaLabel,
			ctaHref,
			imageUrl,
			status,
			sortOrder
		});

		await services.auditLogs.logAction(
			id ? 'UPDATE_NEWCOMER_CONTENT' : 'CREATE_NEWCOMER_CONTENT',
			'NEWCOMERS',
			String(saved.id),
			`Saved newcomer portal section: ${saved.headline}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	deleteNewcomerContent: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (id) {
			await services.newcomers.deleteNewcomerContent(id);
			await services.auditLogs.logAction(
				'DELETE_NEWCOMER_CONTENT',
				'NEWCOMERS',
				String(id),
				`Deleted newcomer content ID: ${id}`,
				locals.user?.id,
				locals.user?.fullName
			);
		}
		return { success: true };
	}
};
