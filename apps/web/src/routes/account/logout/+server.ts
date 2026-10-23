import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { services } from '$lib/server/services.js';
import { SESSION_COOKIE } from '$lib/server/auth-constants.js';

/**
 * Ends the signed-in member's session. A plain `POST` endpoint rather than a
 * page — there is nothing to render, only a cookie to clear and redirect.
 */
export const POST: RequestHandler = async ({ cookies }) => {
	const token = cookies.get(SESSION_COOKIE);
	if (token) {
		await services.iam.endSession(token).catch(() => undefined);
	}
	cookies.delete(SESSION_COOKIE, { path: '/' });
	throw redirect(303, '/');
};
