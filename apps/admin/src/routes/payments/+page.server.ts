import { markPaymentPaidSchema, readPageRequest } from '@trailblazers/core';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';
import { handleAction } from '$lib/server/actions.js';
import { requireSection } from '$lib/server/auth.js';

/**
 * Giving & payments.
 *
 * ADMIN-only (see `finance` in `permissions.ts`) — this is money, a stricter
 * bar than ordinary content. Paged like `events`, and the one mutation
 * (`markPaid`) goes through `handleAction` for the same validation/audit/error
 * handling every other admin controller gets for free.
 */
export const load: PageServerLoad = async ({ locals, url, setHeaders }) => {
	requireSection(locals.user, 'finance');

	const [page, counts] = await Promise.all([
		services.payments.listAllForAdmin(readPageRequest(url.searchParams)),
		services.payments.getCounts()
	]);

	setHeaders({ 'cache-control': 'private, no-store' });

	return { payments: page.items, pagination: page, counts };
};

export const actions: Actions = {
	/**
	 * Marks a payment paid outside the gateways — cash, a bank transfer, an
	 * EcoCash swipe the provider's own callback never reported. See
	 * `markAsPaidManually` in `payments/service.ts` for the guardrails: it can
	 * only move a still-open payment forward, never re-decide one already
	 * settled.
	 */
	markPaid: (event) =>
		handleAction(event, {
			section: 'finance',
			module: 'AdminPayments',
			schema: markPaymentPaidSchema,
			perform: (data, actor) => services.payments.markAsPaidManually(data.reference, data.note, actor.fullName),
			audit: (data) => ({
				action: 'MARK_PAYMENT_PAID',
				entityType: 'PAYMENT',
				entityId: data.reference,
				details: `Manually marked paid: ${data.reference} — ${data.note}`
			})
		})
};
