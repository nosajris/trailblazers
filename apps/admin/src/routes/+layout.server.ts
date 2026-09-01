import { redirect } from '@sveltejs/kit';
import { canAccessAdmin, canAccessPath, sectionForPath } from '$lib/server/auth.js';
import type { LayoutServerLoad } from './$types';

/**
 * Routes reachable without a session. `/set-password` has to be here: an
 * invited user has no account password yet, so they cannot sign in first.
 * Its own single-use token is the credential.
 */
const PUBLIC_PATHS = new Set(['/login', '/set-password']);

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (PUBLIC_PATHS.has(url.pathname)) {
		// Only bounce a signed-in staff member away from the login form; someone
		// following a reset link while signed in should still be able to use it.
		if (url.pathname === '/login' && locals.user && canAccessAdmin(locals.user.role)) {
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

	// Per-section check on top of portal entry: a secretary is staff, but
	// /users, /settings and /audit-logs are ADMIN-only. Bounce rather than 403
	// so the sidebar link (if it is ever shown to them) degrades gracefully.
	if (!canAccessPath(locals.user.role, url.pathname)) {
		throw redirect(303, '/');
	}

	return {
		minimalShell: false as const,
		user: locals.user,
		// Lets the sidebar hide links the signed-in role cannot open.
		section: sectionForPath(url.pathname)
	};
};
