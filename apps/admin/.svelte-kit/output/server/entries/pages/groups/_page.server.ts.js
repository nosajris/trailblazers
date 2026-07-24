import { fail } from "@sveltejs/kit";
import { s as services } from "../../../chunks/services.js";
const load = async () => {
  const rows = await services.groups.listPublished();
  return { groups: rows };
};
const actions = {
  saveGroup: async ({ request, locals }) => {
    const form = await request.formData();
    const id = form.get("id") ? Number(form.get("id")) : void 0;
    const name = form.get("name")?.toString().trim();
    if (!name) {
      return fail(400, { error: "Group name is required" });
    }
    await services.auditLogs.logAction(
      id ? "UPDATE_GROUP" : "CREATE_GROUP",
      "GROUP",
      String(id || "new"),
      `Saved group: ${name}`,
      locals.user?.id,
      locals.user?.fullName
    );
    return { success: true };
  }
};
export {
  actions,
  load
};
