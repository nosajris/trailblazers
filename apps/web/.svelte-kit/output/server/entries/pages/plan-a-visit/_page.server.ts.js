import { fail } from "@sveltejs/kit";
import { s as services } from "../../../chunks/services.js";
const load = async () => {
  const settings = await services.settings.getBundle();
  return { settings };
};
const actions = {
  registerVipVisit: async ({ request }) => {
    const form = await request.formData();
    const fullName = form.get("fullName")?.toString().trim();
    const email = form.get("email")?.toString().trim();
    const phone = form.get("phone")?.toString().trim() || "";
    const preferredDate = form.get("preferredDate")?.toString().trim() || "";
    if (!fullName || !email) {
      return fail(400, { error: "Name and email are required to register your visit." });
    }
    const saved = await services.inquiries.createInquiry({
      fullName,
      email,
      phone,
      type: "VISITOR",
      message: `VIP Visit Registration for date: ${preferredDate}`
    });
    await services.tasks.createTask(
      `Follow up with VIP Guest: ${fullName}`,
      `Contact ${email} (${phone}) to prepare VIP welcome packet for visit on ${preferredDate}.`,
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
