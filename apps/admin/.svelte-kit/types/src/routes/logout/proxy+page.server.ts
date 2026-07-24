// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { services } from '$lib/server/services.js';
import { SESSION_COOKIE } from '$lib/server/auth-constants.js';

export const actions = {
	default: async ({ cookies, locals }: import('./$types').RequestEvent) => {
		const token = cookies.get(SESSION_COOKIE);
		if (token) {
			await services.iam.deleteSession(token);
			if (locals.user) {
				await services.auditLogs.logAction('LOGOUT', 'USER', String(locals.user.id), `Staff logged out: ${locals.user.email}`, locals.user.id, locals.user.fullName);
			}
			cookies.delete(SESSION_COOKIE, { path: '/' });
		}
		throw redirect(303, '/login');
	}
};
;null as any as Actions;