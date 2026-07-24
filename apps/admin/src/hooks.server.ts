import { services } from '$lib/server/services.js';
import { SESSION_COOKIE } from '$lib/server/auth-constants.js';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	if (token) {
		event.locals.user = await services.iam.validateSession(token);
	} else {
		event.locals.user = null;
	}
	return resolve(event);
};
