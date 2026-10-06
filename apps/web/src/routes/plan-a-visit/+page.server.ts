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
	setHeaders(cacheHeaders('static'));

	const settings = await services.settings.getBundle();
	return { settings };
};

export const actions: Actions = {
	registerVipVisit: async ({ request, getClientAddress }) => {
		const form = await request.formData();

		if (isHoneypotTripped(form)) {
			logger.warn('PlanAVisit', 'honeypot tripped', { address: getClientAddress() });
			return { success: true };
		}

		const throttle = consumeFormSubmission(getClientAddress(), 'plan-a-visit');
		if (!throttle.allowed) {
			return fail(429, { error: throttleMessage(throttle.retryAfterSeconds) });
		}

		const fullName = form.get('fullName')?.toString().trim();
		const email = form.get('email')?.toString().trim();
		const phone = form.get('phone')?.toString().trim() || '';
		const preferredDate = form.get('preferredDate')?.toString().trim() || '';

		if (!fullName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, { error: 'Please enter your name and a valid email address.' });
		}
		if (fullName.length > 120 || phone.length > 40 || !/^(\d{4}-\d{2}-\d{2})?$/.test(preferredDate)) {
			return fail(400, { error: 'Some details look too long or invalid. Please check and try again.' });
		}
		const dateNote = preferredDate ? ` for ${preferredDate}` : '';

		// Save inquiry (phone is carried in the follow-up task; inquiries do not store it)
		const saved = await services.inquiries.createInquiry({
			fullName,
			email,
			phone,
			type: 'VISITOR',
			message: `VIP Visit Registration${dateNote}`
		});

		// Auto-create staff follow-up task
		await services.tasks.createTask(
			`Follow up with VIP Guest: ${fullName}`,
			`Contact ${email}${phone ? ` (${phone})` : ''} to prepare a welcome for their visit${dateNote}.`,
			'INQUIRY',
			String(saved.id)
		);

		return { success: true };
	}
};
