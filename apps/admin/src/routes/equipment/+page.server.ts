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
	},

	/**
	 * Staff upload for this field's image. Same shape as the other
	 * `uploadImage` actions in this app — the client sets the returned URL
	 * into the modal's own field.
	 */
	uploadImage: async ({ request, locals }) => {
		const form = await request.formData();
		const file = form.get('file');
		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { error: 'Choose an image to upload.' });
		}

		try {
			const buffer = Buffer.from(await file.arrayBuffer());
			const asset = await services.media.upload(
				{ buffer, mimeType: file.type, size: file.size },
				locals.user?.id
			);
			return { success: true, uploadedUrl: asset.url };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'That upload failed.';
			return fail(400, { error: message });
		}
	}
};
