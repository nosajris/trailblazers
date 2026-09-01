import { services } from '$lib/server/services';
import { fail } from '@sveltejs/kit';
import { logger } from '@trailblazers/core';
import {
	consumeFormSubmission,
	isHoneypotTripped,
	throttleMessage
} from '$lib/server/rate-limit';
import { cacheHeaders } from '$lib/server/cache';

export const load = async ({ setHeaders }: { setHeaders: (h: Record<string, string>) => void }) => {
	setHeaders(cacheHeaders('static'));
	return { settings: await services.settings.getBundle() };
};

export const actions = {
	default: async ({
		request,
		getClientAddress
	}: {
		request: Request;
		getClientAddress: () => string;
	}) => {
		const data = await request.formData();

		// Silently accept and drop bot submissions: reporting the rejection just
		// tells the author which field gave them away.
		if (isHoneypotTripped(data)) {
			logger.warn('ContactForm', 'honeypot tripped', { address: getClientAddress() });
			return { success: true };
		}

		const throttle = consumeFormSubmission(getClientAddress(), 'contact');
		if (!throttle.allowed) {
			return fail(429, { error: throttleMessage(throttle.retryAfterSeconds) });
		}

		const name = data.get('name')?.toString();
		const email = data.get('email')?.toString();
		const message = data.get('message')?.toString();

		if (!name || !email || !message) {
			return fail(400, { missing: true });
		}

		try {
			await services.inquiries.createGeneral({ name, email, message });
			return { success: true };
		} catch (err) {
			logger.error('ContactForm', 'submission failed', {
				message: err instanceof Error ? err.message : String(err)
			});
			return fail(500, { error: 'We could not send that just now. Please try again shortly.' });
		}
	}
};
