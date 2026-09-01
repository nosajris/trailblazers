import { services } from '$lib/server/services';
import { error, fail } from '@sveltejs/kit';
import { PolicyError, logger, parseForm, registerForEventSchema, summarizeErrors } from '@trailblazers/core';
import { cacheHeaders } from '$lib/server/cache';
import {
	consumeFormSubmission,
	isHoneypotTripped,
	throttleMessage
} from '$lib/server/rate-limit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const eventId = Number(params.id);
	if (!Number.isInteger(eventId)) throw error(404, 'Event not found');

	const [event, settings, availability] = await Promise.all([
		services.events.getById(eventId),
		services.settings.getBundle(),
		services.eventRegistrations.getAvailability(eventId)
	]);

	if (!event) throw error(404, 'Event not found');

	// Seat counts change as people register, so this page is cached briefly
	// rather than for the usual content window.
	setHeaders(cacheHeaders('dynamic'));

	return { event, settings, availability };
};

export const actions: Actions = {
	/** Public RSVP. Confirms a seat, or joins the waitlist when full. */
	register: async ({ request, params, getClientAddress }) => {
		const form = await request.formData();

		if (isHoneypotTripped(form)) {
			logger.warn('EventRegistration', 'honeypot tripped', { address: getClientAddress() });
			return { success: true, status: 'CONFIRMED' as const };
		}

		const throttle = consumeFormSubmission(getClientAddress(), 'event-register');
		if (!throttle.allowed) {
			return fail(429, { error: throttleMessage(throttle.retryAfterSeconds) });
		}

		// The event comes from the URL, not the form, so a crafted POST cannot
		// register someone for a different event than the page they are on.
		form.set('eventId', params.id);

		const parsed = parseForm(form, registerForEventSchema);
		if (!parsed.success) {
			return fail(400, { error: summarizeErrors(parsed.errors), errors: parsed.errors });
		}

		try {
			const result = await services.eventRegistrations.register(parsed.data);

			// Never let a failed notification fail the registration itself.
			await services.email
				.sendEventRegistration(
					parsed.data.email,
					parsed.data.fullName,
					result.eventTitle,
					result.status === 'WAITLIST' ? 'WAITLIST' : 'CONFIRMED'
				)
				.catch(() => undefined);

			return {
				success: true,
				status: result.status,
				alreadyRegistered: result.alreadyRegistered
			};
		} catch (err) {
			if (err instanceof PolicyError) return fail(409, { error: err.message });

			logger.error('EventRegistration', 'failed', {
				message: err instanceof Error ? err.message : String(err)
			});
			return fail(500, { error: 'We could not complete that just now. Please try again.' });
		}
	}
};
