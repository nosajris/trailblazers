import { services } from '$lib/server/services';

export const load = async () => {
	const [businesses, rentalGear, settings] = await Promise.all([
		services.bep.listVerifiedProfiles(),
		services.bep.listAvailableEquipment(),
		services.settings.getBundle()
	]);

	return { businesses, rentalGear, settings };
};
