import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const leaders = await services.leaders.getAllForAdmin();
	return { leaders };
};

export const actions: Actions = {
	saveLeader: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') ? Number(form.get('id')) : undefined;
		const name = form.get('name')?.toString().trim();
		const role = form.get('role')?.toString().trim();
		const imageUrl = form.get('imageUrl')?.toString().trim();
		const status = form.get('status')?.toString().trim() || 'PUBLISHED';
		const order = form.get('order') ? Number(form.get('order')) : 0;

		if (!name || !role) {
			return fail(400, { error: 'Leader name and role are required' });
		}

		const saved = await services.leaders.saveLeader({
			id,
			name,
			role,
			imageUrl,
			status,
			order
		});

		await services.auditLogs.logAction(
			id ? 'UPDATE_LEADER' : 'CREATE_LEADER',
			'LEADER',
			String(saved.id),
			`Saved ministry leader: ${saved.name}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	deleteLeader: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (id) {
			await services.leaders.deleteLeader(id);
			await services.auditLogs.logAction(
				'DELETE_LEADER',
				'LEADER',
				String(id),
				`Deleted leader ID: ${id}`,
				locals.user?.id,
				locals.user?.fullName
			);
		}
		return { success: true };
	}
};
