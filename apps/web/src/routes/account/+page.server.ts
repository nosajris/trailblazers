import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { services } from '$lib/server/services.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/account/login?next=/account');
	}

	const [payments, registrations] = await Promise.all([
		services.payments.listForEmail(locals.user.email),
		services.eventRegistrations.listForEmail(locals.user.email)
	]);

	return {
		settings: await services.settings.getBundle(),
		user: locals.user,
		payments,
		registrations
	};
};
