import { s as services } from "../../../chunks/services.js";
const load = async () => {
  const settings = await services.settings.getBundle();
  return { settings };
};
const actions = {
  saveSettings: async ({ request, locals }) => {
    const form = await request.formData();
    form.get("watchUrl")?.toString().trim();
    form.get("givingUrl")?.toString().trim();
    await services.auditLogs.logAction("UPDATE_SETTINGS", "SETTINGS", "global", `Updated site settings`, locals.user?.id, locals.user?.fullName);
    return { success: true };
  }
};
export {
  actions,
  load
};
