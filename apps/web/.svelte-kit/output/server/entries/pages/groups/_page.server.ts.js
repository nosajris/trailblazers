import { s as services } from "../../../chunks/services.js";
const load = async () => {
  const [settings, groups] = await Promise.all([
    services.settings.getBundle(),
    services.groups.listPublished()
  ]);
  return { settings, groups };
};
export {
  load
};
