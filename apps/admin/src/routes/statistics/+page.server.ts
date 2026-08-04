import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const records = await services.statistics.getAllForAdmin();
	return { records };
};

export const actions: Actions = {
	saveStatistic: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') ? Number(form.get('id')) : undefined;
		const districtName = form.get('districtName')?.toString().trim();
		const date = form.get('date')?.toString().trim();
		const attendanceCount = form.get('attendanceCount') ? Number(form.get('attendanceCount')) : 0;
		const salvationsCount = form.get('salvationsCount') ? Number(form.get('salvationsCount')) : 0;
		const notes = form.get('notes')?.toString().trim();

		if (!districtName || !date) {
			return fail(400, { error: 'District name and date are required' });
		}

		const saved = await services.statistics.saveStatistic({
			id,
			districtName,
			date,
			attendanceCount,
			salvationsCount,
			notes,
			submittedBy: locals.user?.id
		});

		await services.auditLogs.logAction(
			id ? 'UPDATE_STATISTIC' : 'CREATE_STATISTIC',
			'STATISTIC',
			String(saved.id),
			`Saved district statistic: ${saved.districtName} (${saved.date})`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	deleteStatistic: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (id) {
			await services.statistics.deleteStatistic(id);
			await services.auditLogs.logAction(
				'DELETE_STATISTIC',
				'STATISTIC',
				String(id),
				`Deleted statistic record ID: ${id}`,
				locals.user?.id,
				locals.user?.fullName
			);
		}
		return { success: true };
	}
};
