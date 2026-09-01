import { fail } from '@sveltejs/kit';
import { services } from '$lib/server/services';
import { logger } from '@trailblazers/core';
import {
	consumeFormSubmission,
	isHoneypotTripped,
	throttleMessage
} from '$lib/server/rate-limit';
import type { PageServerLoad, Actions } from './$types';
import { cacheHeaders } from '$lib/server/cache';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders(cacheHeaders('content'));

	const [settings, section] = await Promise.all([
		services.settings.getBundle(),
		services.serve.getPrimaryPublished()
	]);
	return { settings, section };
};

export const actions: Actions = {
	applyToServe: async ({ request, getClientAddress }) => {
		const form = await request.formData();

		if (isHoneypotTripped(form)) {
			logger.warn('ServeApplication', 'honeypot tripped', { address: getClientAddress() });
			return { success: true };
		}

		const throttle = consumeFormSubmission(getClientAddress(), 'serve');
		if (!throttle.allowed) {
			return fail(429, { error: throttleMessage(throttle.retryAfterSeconds) });
		}

		const fullName = form.get('fullName')?.toString().trim();
		const email = form.get('email')?.toString().trim();
		const team = form.get('team')?.toString().trim() || 'General Serving Team';

		if (!fullName || !email) {
			return fail(400, { error: 'Name and email are required to submit volunteer application.' });
		}

		const saved = await services.inquiries.createInquiry({
			fullName,
			email,
			type: 'SERVE',
			message: `Volunteer Serve Application for Team: ${team}`
		});

		await services.tasks.createTask(
			`New Volunteer Application: ${fullName}`,
			`Contact ${email} regarding joining the ${team} serve team.`,
			'INQUIRY',
			String(saved.id)
		);

		return { success: true };
	}
};
