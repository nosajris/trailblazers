import { fail } from "@sveltejs/kit";
import { s as services } from "../../../chunks/services.js";
const load = async () => {
  const [settings, section] = await Promise.all([
    services.settings.getBundle(),
    services.serve.getPrimaryPublished()
  ]);
  return { settings, section };
};
const actions = {
  applyToServe: async ({ request }) => {
    const form = await request.formData();
    const fullName = form.get("fullName")?.toString().trim();
    const email = form.get("email")?.toString().trim();
    const team = form.get("team")?.toString().trim() || "General Serving Team";
    if (!fullName || !email) {
      return fail(400, { error: "Name and email are required to submit volunteer application." });
    }
    const saved = await services.inquiries.createInquiry({
      fullName,
      email,
      type: "SERVE",
      message: `Volunteer Serve Application for Team: ${team}`
    });
    await services.tasks.createTask(
      `New Volunteer Application: ${fullName}`,
      `Contact ${email} regarding joining the ${team} serve team.`,
      "INQUIRY",
      String(saved.id)
    );
    return { success: true };
  }
};
export {
  actions,
  load
};
