import { services } from '$lib/server/services';
import { error, fail, redirect } from '@sveltejs/kit';
import {
	PolicyError,
	logger,
	mintPaymentReference,
	ogImageUrl,
	parseForm,
	registerForEventSchema,
	summarizeErrors
} from '@trailblazers/core';
import { cacheHeaders } from '$lib/server/cache';
import { guardFormSubmission, issueFormToken } from '$lib/server/form-guard';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders, url }) => {
	const eventId = Number(params.id);
	if (!Number.isInteger(eventId)) throw error(404, 'Event not found');

	const [event, settings, availability] = await Promise.all([
		services.events.getById(eventId),
		services.settings.getBundle(),
		// Seat counts are a nicety. If that query fails (for example a missing
		// migration) the event page should still render, without the counter.
		services.eventRegistrations.getAvailability(eventId).catch((err: unknown) => {
			logger.error('EventPage', 'availability lookup failed', {
				eventId,
				message: err instanceof Error ? err.message : String(err)
			});
			return null;
		})
	]);

	if (!event) throw error(404, 'Event not found');

	// Seat counts change as people register, so this page is cached briefly
	// rather than for the usual content window.
	setHeaders(cacheHeaders('dynamic'));

	// Only when nobody has uploaded a photo for this event, and only when
	// there's a secret to sign it with — without SECRET_KEY the /og route
	// would 403 anyway, so there's nothing to gain from building the URL.
	const ogImage =
		!event.imageUrl && process.env.SECRET_KEY
			? ogImageUrl(url.origin, process.env.SECRET_KEY, { title: event.title, kicker: 'Event' })
			: null;

	return {
		event,
		settings,
		availability,
		ogImage,
		// Hides the "pay to register" step rather than sending someone through
		// a registration that can never be paid for and confirmed.
		paymentsAvailable: services.payments.isAnyProviderConfigured(),
		formToken: issueFormToken('event-register')
	};
};

export const actions: Actions = {
	/**
	 * Public RSVP. Confirms a seat, joins the waitlist when full, or — for a
	 * priced event — starts a payment and holds the seat as PENDING_PAYMENT
	 * until it clears (see `nextRegistrationStatus` in `registration.ts`).
	 */
	register: async ({ request, params, getClientAddress, url }) => {
		const form = await request.formData();

		const guard = await guardFormSubmission(form, 'event-register', getClientAddress());
		if (!guard.ok) {
			// A bot tripped the decoy field: answer as a success and drop it,
			// rather than naming the field that gave it away.
			if (guard.pretendSuccess) return { success: true, status: 'CONFIRMED' as const };
			return fail(guard.status, { error: guard.message });
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

			if (result.requiresPayment && !result.alreadyRegistered) {
				const reference = mintPaymentReference('EVENT_REGISTRATION');
				try {
					const { result: paymentResult } = await services.payments.startPayment({
						purpose: 'EVENT_REGISTRATION',
						purposeId: result.registrationId,
						reference,
						amount: result.priceCents,
						description: `Registration: ${result.eventTitle}`,
						payer: {
							name: parsed.data.fullName,
							email: parsed.data.email,
							phone: parsed.data.phone
						},
						returnUrl: `${url.origin}/payments/${reference}`,
						resultUrl: `${url.origin}/api/payments/${services.payments.defaultProviderName().toLowerCase()}`
					});

					const redirectTo =
						paymentResult.kind === 'redirect'
							? paymentResult.redirectUrl
							: `/payments/${reference}`;
					redirect(303, redirectTo);
				} catch (paymentErr) {
					logger.error('EventRegistration', 'starting payment failed', {
						registrationId: result.registrationId,
						message: paymentErr instanceof Error ? paymentErr.message : String(paymentErr)
					});
					return fail(500, {
						error:
							'Your seat is held, but we could not start payment just now. Please try again — your details are saved.',
						status: 'PENDING_PAYMENT' as const,
						success: true
					});
				}
			}

			if (result.requiresPayment && result.alreadyRegistered) {
				// Already mid-payment from an earlier attempt: send them to pick it
				// back up rather than starting a second, duplicate payment.
				return {
					success: true,
					status: result.status,
					alreadyRegistered: true,
					awaitingPayment: true
				};
			}

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
