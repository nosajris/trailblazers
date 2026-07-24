import { s as services } from "../../../chunks/services.js";
import { redirect } from "@sveltejs/kit";
const load = async () => {
  const settings = await services.settings.getBundle();
  const u = settings.siteExtras.givingUrl?.trim();
  if (u && /^https?:\/\//i.test(u)) {
    throw redirect(302, u);
  }
  return { settings };
};
export {
  load
};
