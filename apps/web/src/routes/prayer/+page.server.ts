import { services } from '$lib/server/services';
import { fail } from '@sveltejs/kit';
import { logger, parseForm, submitPrayerSchema, summarizeErrors } from '@trailblazers/core';
import { cacheHeaders } from '$lib/server/cache';
import {
	consumeFormSubmission,
	isHoneypotTripped,
	throttleMessage
} from '$lib/server/rate-limit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	// The wall only ever contains requests with both consent and staff review,
	// so it is safe to cache — but briefly, since staff unpublish things.
	setHeaders(cacheHeaders('dynamic'));

	const [settings, wall] = await Promise.all([
		services.settings.getBundle(),
		services.prayer.listPublic(20)
	]);

	return { settings, wall };
};

export const actions: Actions = {
	submit: async ({ request, getClientAddress }) => {
		const form = await request.formData();

		if (isHoneypotTripped(form)) {
			logger.warn('Prayer', 'honeypot tripped', { address: getClientAddress() });
			return { success: true };
		}

		const throttle = consumeFormSubmission(getClientAddress(), 'prayer');
		if (!throttle.allowed) {
			return fail(429, { error: throttleMessage(throttle.retryAfterSeconds) });
		}

		const parsed = parseForm(form, submitPrayerSchema);
		if (!parsed.success) {
			return fail(400, { error: summarizeErrors(parsed.errors), errors: parsed.errors });
		}

		try {
			await services.prayer.submit(parsed.data);

			// Notify the office that something arrived — never the content. A
			// prayer request can name a diagnosis or a bereavement, and email is
			// not a confidential channel.
			await services.email
				.notifyOffice(
					'New prayer request',
					'A new prayer request has been submitted. Open the staff portal to read it.\n\n' +
						'The content is deliberately not included in this email.'
				)
				.catch(() => undefined);

			return { success: true };
		} catch (err) {
			logger.error('Prayer', 'submission failed', {
				message: err instanceof Error ? err.message : String(err)
			});
			return fail(500, { error: 'We could not send that just now. Please try again.' });
		}
	}
};
