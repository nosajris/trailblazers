import { error } from '@sveltejs/kit';
import { services } from '$lib/server/services';
import { cacheHeaders } from '$lib/server/cache';
import type { PageServerLoad } from './$types';

/**
 * Where a payer's browser lands after Paynow/Pesepay (the `returnUrl` every
 * payment is started with) — and where a visitor can come back to check on a
 * mobile-money "instructions" payment that is still waiting on their phone.
 *
 * This page never *decides* a payment is paid — only the signed/encrypted
 * callback at `/api/payments/[provider]` does that (see its doc comment). It
 * actively polls the provider once as a fallback for the ordinary case where
 * the payer's browser gets back here before the provider's own callback has
 * landed, so "still pending" here usually resolves on a reload a few seconds
 * later rather than needing the visitor to wait on this exact page.
 */
export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const reference = params.reference;
	const [settings, existing] = await Promise.all([
		services.settings.getBundle(),
		services.payments.getByReference(reference)
	]);
	let payment = existing;
	if (!payment) error(404, 'No such payment.');

	if (payment.status === 'PENDING') {
		const refreshed = await services.payments.refreshStatus(reference).catch(() => null);
		if (refreshed) payment = refreshed;

		if (
			payment.status === 'PAID' &&
			payment.purpose === 'EVENT_REGISTRATION' &&
			payment.purposeId
		) {
			await services.eventRegistrations
				.confirmPaidRegistration(payment.purposeId)
				.catch(() => undefined);
		}
	}

	let event: { id: number; title: string } | null = null;
	if (payment.purpose === 'EVENT_REGISTRATION' && payment.purposeId) {
		const registration = await services.eventRegistrations.getById(payment.purposeId);
		if (registration) {
			const found = await services.events.getById(registration.eventId);
			if (found) event = { id: found.id, title: found.title };
		}
	}

	// A payment that is still pending can flip within seconds — never cache this.
	setHeaders(cacheHeaders('private'));

	return {
		settings,
		reference,
		status: payment.status,
		purpose: payment.purpose,
		amount: payment.amount,
		currency: payment.currency,
		event
	};
};
