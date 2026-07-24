import type { PageServerLoad } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async () => {
	const [sermons, events, groups, auditLogs, tasks] = await Promise.all([
		services.sermons.getAllSermons(),
		services.events.getAllEventsForAdmin(),
		services.groups.listPublished(),
		services.auditLogs.getRecentLogs(10),
		services.tasks.getAllTasks()
	]);

	return {
		stats: {
			totalSermons: sermons.length,
			totalEvents: events.length,
			totalGroups: groups.length,
			pendingTasks: tasks.filter((t: { isCompleted: boolean }) => !t.isCompleted).length
		},
		recentAuditLogs: auditLogs,
		tasks
	};
};
