import { error, text } from '@sveltejs/kit';
import { logger } from '@trailblazers/core';
import { services } from '$lib/server/services';
import type { RequestHandler } from './$types';

/**
 * Where Paynow/Pesepay POST their server-to-server result — the `resultUrl`
 * every payment is started with. This is the only path that is allowed to
 * move a payment from PENDING to PAID: a payer's browser landing back on
 * `/payments/[reference]` only *asks* (via `refreshStatus`'s active poll),
 * it never decides on its own.
 *
 * Verification happens inside `services.payments.handleCallback`, which
 * delegates to the named provider's own `parseResult` (a signed hash for
 * Paynow, an encrypted payload for Pesepay) — nothing here trusts the body
 * until that has vouched for it.
 *
 * Always answers 200: both gateways retry a non-2xx, and a payment we could
 * not make sense of (an unknown reference, a verification failure) is
 * already logged — retrying the identical POST would not change that.
 */
export const POST: RequestHandler = async ({ params, request }) => {
	const providerName = params.provider?.toUpperCase();
	if (providerName !== 'PAYNOW' && providerName !== 'PESEPAY') {
		error(404, 'No such provider.');
	}

	const contentType = request.headers.get('content-type') ?? '';
	let body: Record<string, string>;

	if (contentType.includes('application/json')) {
		const json = await request.json().catch(() => ({}));
		body = Object.fromEntries(
			Object.entries(json ?? {}).map(([key, value]) => [key, String(value)])
		);
	} else {
		const form = await request.formData();
		body = Object.fromEntries([...form.entries()].map(([key, value]) => [key, String(value)]));
	}

	const outcome = await services.payments.handleCallback(providerName, body);

	if (outcome.ok && outcome.changed && outcome.payment) {
		await settlePayment(outcome.payment);
	}

	// Both gateways just want a 200; the body is for humans reading logs.
	return text('OK');
};

/**
 * What happens once a payment reaches a terminal status — the one place that
 * composes the generic payments module with what the payment was *for*.
 * Keeping this here, rather than inside `payments/service.ts`, is what lets
 * that module stay ignorant of events, giving, or anything else that might
 * use it next.
 */
async function settlePayment(payment: {
	purpose: string;
	purposeId: number | null;
	status: string;
	reference: string;
	payerEmail: string;
	payerName: string;
}) {
	if (payment.status !== 'PAID') return;

	if (payment.purpose === 'EVENT_REGISTRATION' && payment.purposeId) {
		const confirmed = await services.eventRegistrations.confirmPaidRegistration(payment.purposeId);
		if (confirmed) {
			const event = await services.events.getById(confirmed.eventId);
			await services.email
				.sendEventRegistration(
					confirmed.email,
					confirmed.fullName,
					event?.title ?? 'the event',
					'CONFIRMED'
				)
				.catch(() => undefined);
		}
		return;
	}

	if (payment.purpose === 'GIVING') {
		await services.email
			.send({
				to: payment.payerEmail,
				subject: 'Thank you for your gift',
				text: `Hi ${payment.payerName},\n\nThank you — your gift has been received. God bless your generosity.\n\nReference: ${payment.reference}`
			})
			.catch(() => undefined);
		await services.email
			.notifyOffice(
				'Online gift received',
				`${payment.payerName} (${payment.payerEmail}) gave online. Reference: ${payment.reference}.`
			)
			.catch(() => undefined);
		logger.info('Giving', 'online gift confirmed', { reference: payment.reference });
	}
}
