import { services } from '$lib/server/services';
import { fail } from '@sveltejs/kit';
import { logger } from '@trailblazers/core';
import { guardFormSubmission, issueFormToken } from '$lib/server/form-guard';
import { cacheHeaders } from '$lib/server/cache';

export const load = async ({ setHeaders }: { setHeaders: (h: Record<string, string>) => void }) => {
	setHeaders(cacheHeaders('static'));
	return {
		settings: await services.settings.getBundle(),
		formToken: issueFormToken('contact')
	};
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
		const guard = await guardFormSubmission(data, 'contact', getClientAddress());
		if (!guard.ok) {
			// A bot tripped the decoy field: answer as a success and drop it,
			// rather than naming the field that gave it away.
			if (guard.pretendSuccess) return { success: true };
			return fail(guard.status, { error: guard.message });
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
