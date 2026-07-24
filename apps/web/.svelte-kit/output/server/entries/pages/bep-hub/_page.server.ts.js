import { s as services } from "../../../chunks/services.js";
const load = async () => {
  const [businesses, rentalGear, settings] = await Promise.all([
    services.bep.listVerifiedProfiles(),
    services.bep.listAvailableEquipment(),
    services.settings.getBundle()
  ]);
  return { businesses, rentalGear, settings };
};
export {
  load
};
