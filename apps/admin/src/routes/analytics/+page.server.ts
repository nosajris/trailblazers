import type { PageServerLoad } from './$types';
import { services } from '$lib/server/services.js';
import { requireSection } from '$lib/server/auth.js';

/**
 * Cookieless site analytics: no visitor identity is stored, only daily
 * counts (see `@trailblazers/core`'s analytics module), so there is nothing
 * sensitive here that would call for a narrower section than `content`.
 */
export const load: PageServerLoad = async ({ locals, url, setHeaders }) => {
	requireSection(locals.user, 'content');

	const days = url.searchParams.get('range') === '30' ? 30 : 7;
	const report = await services.analytics.report(days);

	// Staff-specific and changes by the minute: never cache it.
	setHeaders({ 'cache-control': 'private, no-store' });

	return { report, days };
};
