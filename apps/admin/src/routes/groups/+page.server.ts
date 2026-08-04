import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const rows = await services.groups.getAllForAdmin();
	return { groups: rows };
};

export const actions: Actions = {
	saveGroup: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') ? Number(form.get('id')) : undefined;
		const name = form.get('name')?.toString().trim();
		const leader = form.get('leader')?.toString().trim();
		const dayTime = form.get('dayTime')?.toString().trim();
		const type = (form.get('type')?.toString() || 'CAMPUS') as 'CAMPUS' | 'PRO' | 'INTEREST' | 'ONLINE';
		const imageUrl = form.get('imageUrl')?.toString().trim();
		const description = form.get('description')?.toString().trim();
		const status = form.get('status')?.toString().trim() || 'PUBLISHED';
		const sortOrder = form.get('sortOrder') ? Number(form.get('sortOrder')) : 0;

		if (!name || !leader || !dayTime) {
			return fail(400, { error: 'Group name, leader, and meeting schedule are required' });
		}

		const saved = await services.groups.saveGroup({
			id,
			name,
			leader,
			dayTime,
			type,
			imageUrl,
			description,
			status,
			sortOrder
		});

		await services.auditLogs.logAction(
			id ? 'UPDATE_GROUP' : 'CREATE_GROUP',
			'GROUP',
			String(saved.id),
			`Saved connect group: ${saved.name}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	deleteGroup: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (id) {
			await services.groups.deleteGroup(id);
			await services.auditLogs.logAction(
				'DELETE_GROUP',
				'GROUP',
				String(id),
				`Deleted group ID: ${id}`,
				locals.user?.id,
				locals.user?.fullName
			);
		}
		return { success: true };
	}
};

