// @ts-nocheck
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load = async () => {
	const rows = await services.groups.listPublished();
	return { groups: rows };
};

export const actions = {
	saveGroup: async ({ request, locals }: import('./$types').RequestEvent) => {
		const form = await request.formData();
		const id = form.get('id') ? Number(form.get('id')) : undefined;
		const name = form.get('name')?.toString().trim();

		if (!name) {
			return fail(400, { error: 'Group name is required' });
		}

		await services.auditLogs.logAction(
			id ? 'UPDATE_GROUP' : 'CREATE_GROUP',
			'GROUP',
			String(id || 'new'),
			`Saved group: ${name}`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	}
};
;null as any as PageServerLoad;;null as any as Actions;