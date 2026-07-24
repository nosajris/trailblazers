// @ts-nocheck
import type { PageServerLoad } from './$types';
import { services } from '$lib/server/services.js';

export const load = async () => {
	const logs = await services.auditLogs.getRecentLogs(100);
	return { auditLogs: logs };
};
;null as any as PageServerLoad;