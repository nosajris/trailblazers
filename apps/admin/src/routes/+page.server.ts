import type { PageServerLoad } from './$types';
import { services } from '$lib/server/services.js';
import { requireSection } from '$lib/server/auth.js';

/**
 * Dashboard.
 *
 * This used to call eleven `getAllForAdmin()` methods and take `.length` of
 * each — every row of eleven tables pulled across the wire to produce eleven
 * integers, on every load. It is now three queries: the counts (issued in
 * parallel), the recent audit entries, and a capped list of open tasks.
 */
export const load: PageServerLoad = async ({ locals, setHeaders }) => {
	requireSection(locals.user, 'content');

	const [stats, recentAuditLogs, tasks] = await Promise.all([
		services.dashboard.getCounts(),
		services.auditLogs.getRecentLogs(10),
		services.dashboard.listOpenTasks(10)
	]);

	// Staff-specific and quick to change: never cache it in a shared cache.
	setHeaders({ 'cache-control': 'private, no-store' });

	return { stats, recentAuditLogs, tasks };
};
