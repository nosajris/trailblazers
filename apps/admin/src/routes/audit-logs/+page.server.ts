import type { PageServerLoad } from './$types';
import { services } from '$lib/server/services.js';
import { requireSection } from '$lib/server/auth.js';

export const load: PageServerLoad = async ({ locals }) => {
	// The security log names who did what, so it is ADMIN-only.
	requireSection(locals.user, 'audit');
	const logs = await services.auditLogs.getRecentLogs(100);
	return { auditLogs: logs };
};
