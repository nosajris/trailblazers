import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const equipmentList = await services.equipment.getAllForAdmin();
	return { equipmentList };
};

export const actions: Actions = {
	saveEquipment: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') ? Number(form.get('id')) : undefined;
		const name = form.get('name')?.toString().trim();
		const description = form.get('description')?.toString().trim();
		const status = (form.get('status')?.toString() || 'AVAILABLE') as 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
		const dailyRate = form.get('dailyRate') ? Number(form.get('dailyRate')) : 0;
		const imageUrl = form.get('imageUrl')?.toString().trim();
		const sortOrder = form.get('sortOrder') ? Number(form.get('sortOrder')) : 0;

		if (!name) {
			return fail(400, { error: 'Equipment name is required' });
		}

		const saved = await services.equipment.saveEquipment({
			id,
			name,
			description,
			status,
			dailyRate,
			imageUrl,
			sortOrder
		});

		await services.auditLogs.logAction(
			id ? 'UPDATE_EQUIPMENT' : 'CREATE_EQUIPMENT',
			'EQUIPMENT',
			String(saved.id),
			`Saved equipment item: ${saved.name}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	deleteEquipment: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (id) {
			await services.equipment.deleteEquipment(id);
			await services.auditLogs.logAction(
				'DELETE_EQUIPMENT',
				'EQUIPMENT',
				String(id),
				`Deleted equipment ID: ${id}`,
				locals.user?.id,
				locals.user?.fullName
			);
		}
		return { success: true };
	}
};
