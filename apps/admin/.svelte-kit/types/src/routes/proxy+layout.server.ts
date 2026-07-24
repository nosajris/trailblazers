// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import { canAccessAdmin } from '$lib/server/auth.js';
import type { LayoutServerLoad } from './$types';

export const load = async ({ locals, url }: Parameters<LayoutServerLoad>[0]) => {
	const isLogin = url.pathname === '/login';

	if (isLogin) {
		if (locals.user && canAccessAdmin(locals.user.role)) {
			throw redirect(303, '/');
		}
		return { minimalShell: true as const };
	}

	if (!locals.user) {
		throw redirect(303, '/login');
	}

	if (!canAccessAdmin(locals.user.role)) {
		throw redirect(303, '/login');
	}

	return { minimalShell: false as const, user: locals.user };
};
