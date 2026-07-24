// @ts-nocheck
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load = async () => {
	const settings = await services.settings.getBundle();
	return { settings };
};

export const actions = {
	saveSettings: async ({ request, locals }: import('./$types').RequestEvent) => {
		const form = await request.formData();
		const watchUrl = form.get('watchUrl')?.toString().trim();
		const givingUrl = form.get('givingUrl')?.toString().trim();

		await services.auditLogs.logAction('UPDATE_SETTINGS', 'SETTINGS', 'global', `Updated site settings`, locals.user?.id, locals.user?.fullName);
		return { success: true };
	}
};
;null as any as PageServerLoad;;null as any as Actions;