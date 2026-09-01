import { services } from '$lib/server/services';
import { cacheHeaders } from '$lib/server/cache';

export const load = async ({ setHeaders }) => {
	setHeaders(cacheHeaders('content'));

	const [businesses, rentalGear, settings] = await Promise.all([
		services.bep.listVerifiedProfiles(),
		services.bep.listAvailableEquipment(),
		services.settings.getBundle()
	]);

	return { businesses, rentalGear, settings };
};
