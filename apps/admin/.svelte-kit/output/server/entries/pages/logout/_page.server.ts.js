import { redirect } from "@sveltejs/kit";
import { s as services } from "../../../chunks/services.js";
import { S as SESSION_COOKIE } from "../../../chunks/auth-constants.js";
const actions = {
  default: async ({ cookies, locals }) => {
    const token = cookies.get(SESSION_COOKIE);
    if (token) {
      await services.iam.deleteSession(token);
      if (locals.user) {
        await services.auditLogs.logAction("LOGOUT", "USER", String(locals.user.id), `Staff logged out: ${locals.user.email}`, locals.user.id, locals.user.fullName);
      }
      cookies.delete(SESSION_COOKIE, { path: "/" });
    }
    throw redirect(303, "/login");
  }
};
export {
  actions
};
