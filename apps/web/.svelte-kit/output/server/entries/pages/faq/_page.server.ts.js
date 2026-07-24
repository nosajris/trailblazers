import { s as services } from "../../../chunks/services.js";
const load = async () => {
  const [settings, items] = await Promise.all([
    services.settings.getBundle(),
    services.faq.listPublished()
  ]);
  return { settings, items };
};
export {
  load
};
