import { redirect } from "@sveltejs/kit";
import { c as canAccessAdmin } from "../../chunks/auth.js";
const load = async ({ locals, url }) => {
  const isLogin = url.pathname === "/login";
  if (isLogin) {
    if (locals.user && canAccessAdmin(locals.user.role)) {
      throw redirect(303, "/");
    }
    return { minimalShell: true };
  }
  if (!locals.user) {
    throw redirect(303, "/login");
  }
  if (!canAccessAdmin(locals.user.role)) {
    throw redirect(303, "/login");
  }
  return { minimalShell: false, user: locals.user };
};
export {
  load
};
