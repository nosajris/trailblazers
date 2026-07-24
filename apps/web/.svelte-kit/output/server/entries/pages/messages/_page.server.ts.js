import { s as services } from "../../../chunks/services.js";
const load = async () => ({
  settings: await services.settings.getBundle()
});
export {
  load
};
