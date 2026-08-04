import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const profiles = await services.bep.getAllForAdmin();
	return { profiles };
};

export const actions: Actions = {
	saveBepProfile: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') ? Number(form.get('id')) : undefined;
		const businessName = form.get('businessName')?.toString().trim();
		const industry = form.get('industry')?.toString().trim();
		const description = form.get('description')?.toString().trim();
		const websiteUrl = form.get('websiteUrl')?.toString().trim();
		const isVerified = form.get('isVerified') === 'on' || form.get('isVerified') === 'true';
		const status = form.get('status')?.toString().trim() || 'PUBLISHED';
		const sortOrder = form.get('sortOrder') ? Number(form.get('sortOrder')) : 0;

		if (!businessName || !industry || !description) {
			return fail(400, { error: 'Business name, industry, and description are required' });
		}

		const saved = await services.bep.saveBepProfile({
			id,
			businessName,
			industry,
			description,
			websiteUrl,
			isVerified,
			status,
			sortOrder
		});

		await services.auditLogs.logAction(
			id ? 'UPDATE_BEP_PROFILE' : 'CREATE_BEP_PROFILE',
			'BEP',
			String(saved.id),
			`Saved BEP business profile: ${saved.businessName}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	deleteBepProfile: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (id) {
			await services.bep.deleteBepProfile(id);
			await services.auditLogs.logAction(
				'DELETE_BEP_PROFILE',
				'BEP',
				String(id),
				`Deleted BEP business profile ID: ${id}`,
				locals.user?.id,
				locals.user?.fullName
			);
		}
		return { success: true };
	}
};
