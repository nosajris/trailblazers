import { services } from '$lib/server/services';
import { logger } from '@trailblazers/core';
import type { PageServerLoad } from './$types';
import { cacheHeaders } from '$lib/server/cache';

/**
 * One-click unsubscribe.
 *
 * The token is the only credential, so the link works without an account and
 * without asking the person to identify themselves again. It is honoured on
 * load rather than behind a confirmation button: several mail clients require
 * unsubscribing to take effect from the link alone.
 */
export const load: PageServerLoad = async ({ url, setHeaders }) => {
	// Token-specific: must never enter a shared cache.
	setHeaders(cacheHeaders('private'));

	const token = url.searchParams.get('token');
	const settings = await services.settings.getBundle();

	if (!token) {
		return { settings, status: 'missing' as const };
	}

	try {
		const result = await services.inquiries.unsubscribeByToken(token);
		return { settings, status: result.ok ? ('done' as const) : ('unknown' as const) };
	} catch (err) {
		logger.error('Unsubscribe', 'failed', {
			message: err instanceof Error ? err.message : String(err)
		});
		return { settings, status: 'error' as const };
	}
};
