import { services } from '$lib/server/services.js';
import { isDatabaseUrlConfigured } from '$lib/server/db.js';
import { SESSION_COOKIE } from '$lib/server/auth-constants.js';
import { assertUsableSecret } from '@trailblazers/core';
import { securityHeaders } from '$lib/server/security-headers.js';
import type { Handle } from '@sveltejs/kit';

/**
 * Fail fast on a missing connection string.
 *
 * `db.ts` falls back to a localhost URL so the build can import it without a
 * database. In a deployed server that fallback used to turn a missing secret
 * into an `ECONNREFUSED` on every single request — the deploy looked healthy
 * and every page 500'd, including the login the staff needed to report it.
 * Hooks are loaded only by the running server, never during the build, so this
 * is the right place to refuse to start.
 */
if (process.env.NODE_ENV === 'production') {
	if (!isDatabaseUrlConfigured) {
		throw new Error(
			'[Startup] DATABASE_URL (or POSTGRES_URL) is not set. Refusing to serve traffic against the ' +
				'local fallback database — set it in the deployment environment and redeploy.'
		);
	}

	// SECRET_KEY keys the HMAC protecting session tokens at rest. It was
	// declared everywhere and read nowhere; now that it is load-bearing, a
	// missing or placeholder value must stop the deploy rather than silently
	// weaken every session.
	assertUsableSecret(process.env.SECRET_KEY);
}

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	if (token) {
		// A token that predates the hashed-session change, or one signed with a
		// different SECRET_KEY, simply fails to resolve — treat it as signed out.
		event.locals.user = await services.iam.validateSession(token).catch(() => null);
	} else {
		event.locals.user = null;
	}

	const response = await resolve(event);
	securityHeaders(event.url).forEach((value, header) => response.headers.set(header, value));
	return response;
};
