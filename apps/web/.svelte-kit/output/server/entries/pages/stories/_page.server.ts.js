import { s as services } from "../../../chunks/services.js";
const load = async () => {
  const [settings, posts] = await Promise.all([
    services.settings.getBundle(),
    services.blog.listPublished(48)
  ]);
  return { settings, posts };
};
export {
  load
};
