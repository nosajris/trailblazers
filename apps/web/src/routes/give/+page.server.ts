import { services } from '$lib/server/services';
import { fail, redirect } from '@sveltejs/kit';
import {
	logger,
	mintPaymentReference,
	parseForm,
	startGivingPaymentSchema,
	summarizeErrors
} from '@trailblazers/core';
import type { PaymentMethod } from '@trailblazers/core';
import { cacheHeaders } from '$lib/server/cache';
import { guardFormSubmission, issueFormToken } from '$lib/server/form-guard';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders(cacheHeaders('static'));

	const settings = await services.settings.getBundle();
	const u = settings.siteExtras.givingUrl?.trim();
	if (u && /^https?:\/\//i.test(u)) {
		redirect(302, u);
	}

	return {
		settings,
		// Hides the online-giving form entirely rather than showing one that
		// can only ever fail — see PaymentConfigError in payments/service.ts.
		paymentsAvailable: services.payments.isAnyProviderConfigured(),
		formToken: issueFormToken('give-online')
	};
};

export const actions: Actions = {
	giveOnline: async ({ request, getClientAddress, url }) => {
		const form = await request.formData();

		const guard = await guardFormSubmission(form, 'give-online', getClientAddress());
		if (!guard.ok) {
			if (guard.pretendSuccess) return fail(400, { error: 'Please try that again.' });
			return fail(guard.status, { error: guard.message });
		}

		const parsed = parseForm(form, startGivingPaymentSchema);
		if (!parsed.success) {
			return fail(400, { error: summarizeErrors(parsed.errors), errors: parsed.errors });
		}

		// Minted here, before the provider is ever called, so `returnUrl` can
		// carry it — the public status page is `/payments/<reference>`.
		const providerName = parsed.data.provider;
		const reference = mintPaymentReference('GIVING');

		let outcome: { redirectTo: string };
		try {
			const { result } = await services.payments.startPayment({
				purpose: 'GIVING',
				reference,
				amount: parsed.data.amountCents,
				description: 'Online gift to Trailblazers',
				payer: { name: parsed.data.fullName, email: parsed.data.email, phone: parsed.data.phone },
				method: parsed.data.method as PaymentMethod,
				provider: providerName,
				returnUrl: `${url.origin}/payments/${reference}`,
				resultUrl: `${url.origin}/api/payments/${(providerName ?? services.payments.defaultProviderName()).toLowerCase()}`
			});

			outcome = {
				// `result.kind === 'redirect'` sends the payer to the gateway's
				// own checkout; `instructions` (mobile-money express) has
				// already prompted their phone, so there is nothing to visit —
				// our own status page is the right landing either way.
				redirectTo: result.kind === 'redirect' ? result.redirectUrl : `/payments/${reference}`
			};
		} catch (err) {
			logger.error('Giving', 'starting a payment failed', {
				message: err instanceof Error ? err.message : String(err)
			});
			return fail(500, {
				error:
					err instanceof Error
						? err.message
						: 'We could not start that payment just now. Please try again shortly.'
			});
		}

		redirect(303, outcome.redirectTo);
	}
};
