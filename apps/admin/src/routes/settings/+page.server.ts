import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const settings = await services.settings.getBundle();
	return { settings };
};

export const actions: Actions = {
	saveSettings: async ({ request, locals }) => {
		const form = await request.formData();
		const watchUrl = form.get('watchUrl')?.toString().trim();
		const givingUrl = form.get('givingUrl')?.toString().trim();

		await services.auditLogs.logAction('UPDATE_SETTINGS', 'SETTINGS', 'global', `Updated site settings`, locals.user?.id, locals.user?.fullName);
		return { success: true };
	}
};
