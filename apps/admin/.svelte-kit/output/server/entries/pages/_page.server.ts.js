import { s as services } from "../../chunks/services.js";
const load = async () => {
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
      pendingTasks: tasks.filter((t) => !t.isCompleted).length
    },
    recentAuditLogs: auditLogs,
    tasks
  };
};
export {
  load
};
