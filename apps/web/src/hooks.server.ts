import { services } from '$lib/server/services';
import { isDatabaseUrlConfigured } from '$lib/server/db';
import { SESSION_COOKIE } from '$lib/server/auth-constants';
import { assertUsableSecret, resolveLocale } from '@trailblazers/core';
import { securityHeaders } from '$lib/server/security-headers';
import type { Handle } from '@sveltejs/kit';

/** Matches the cookie written in +layout.server.ts. */
const LOCALE_COOKIE = 'tb_locale';

/**
 * Fail fast on missing configuration.
 *
 * `db.ts` falls back to a localhost URL so the build and the seed script can
 * import it without a database. In a deployed server that fallback used to turn
 * a missing secret into an `ECONNREFUSED` on every single request — the deploy
 * looked healthy and every page 500'd. Hooks are loaded only by the running
 * server, never during the build, so this is the right place to refuse to start.
 */
if (process.env.NODE_ENV === 'production') {
	if (!isDatabaseUrlConfigured) {
		throw new Error(
			'[Startup] DATABASE_URL (or POSTGRES_URL) is not set. Refusing to serve traffic against the ' +
				'local fallback database — set it in the deployment environment and redeploy.'
		);
	}

	// SECRET_KEY keys the HMAC protecting session tokens at rest.
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

	// Resolved here as well as in the layout so `<html lang>` is correct in the
	// served HTML. A wrong lang attribute makes screen readers use the wrong
	// pronunciation rules and misleads search engines.
	const locale = resolveLocale({
		query: event.url.searchParams.get('lang'),
		cookie: event.cookies.get(LOCALE_COOKIE),
		acceptLanguage: event.request.headers.get('accept-language')
	});

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', locale)
	});

	securityHeaders(event.url).forEach((value, header) => response.headers.set(header, value));
	return response;
};
