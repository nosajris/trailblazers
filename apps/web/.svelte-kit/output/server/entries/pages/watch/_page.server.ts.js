import { s as services } from "../../../chunks/services.js";
const load = async () => {
  const [settings, sermons, featured] = await Promise.all([
    services.settings.getBundle(),
    services.sermons.getAllSermons(),
    services.sermons.getFeaturedSermon()
  ]);
  return {
    settings,
    sermons,
    featuredSermon: featured
  };
};
export {
  load
};
