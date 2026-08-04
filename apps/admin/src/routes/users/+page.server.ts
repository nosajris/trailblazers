import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const users = await services.iam.getAllUsersForAdmin();
	return { users };
};

export const actions: Actions = {
	saveUser: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id') ? Number(form.get('id')) : undefined;
		const fullName = form.get('fullName')?.toString().trim();
		const email = form.get('email')?.toString().trim();
		const role = (form.get('role')?.toString() || 'MEMBER') as 'ADMIN' | 'SECRETARY' | 'LEADER' | 'MEMBER';
		const avatarUrl = form.get('avatarUrl')?.toString().trim();

		if (!fullName || !email) {
			return fail(400, { error: 'Full name and email are required' });
		}

		const saved = await services.iam.saveUser({
			id,
			fullName,
			email,
			role,
			avatarUrl
		});

		await services.auditLogs.logAction(
			id ? 'UPDATE_USER' : 'CREATE_USER',
			'USER',
			String(saved.id),
			`Saved staff user account: ${saved.fullName} (${saved.email})`,
			locals.user?.id,
			locals.user?.fullName
		);

		return { success: true };
	},

	deleteUser: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (id) {
			await services.iam.deleteUser(id);
			await services.auditLogs.logAction(
				'DELETE_USER',
				'USER',
				String(id),
				`Deleted user account ID: ${id}`,
				locals.user?.id,
				locals.user?.fullName
			);
		}
		return { success: true };
	}
};
