import { s as services } from "../../../chunks/services.js";
const load = async () => {
  const logs = await services.auditLogs.getRecentLogs(100);
  return { auditLogs: logs };
};
export {
  load
};
