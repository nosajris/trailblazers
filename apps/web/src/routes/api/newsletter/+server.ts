import { services } from '$lib/server/services';
import { json, redirect, error } from '@sveltejs/kit';
import { logger } from '@trailblazers/core';
import { FORM_TOKEN_FIELD, HONEYPOT_FIELD, guardValues } from '$lib/server/form-guard';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	let email: string | undefined;
	let token: string | undefined;
	let honeypot: string | undefined;

	const ct = request.headers.get('content-type') ?? '';
	const wantsJson =
		ct.includes('application/json') || request.headers.get('accept')?.includes('application/json');

	if (ct.includes('application/json')) {
		const body = await request.json().catch(() => null);
		email = typeof body?.email === 'string' ? body.email : undefined;
		token = typeof body?.[FORM_TOKEN_FIELD] === 'string' ? body[FORM_TOKEN_FIELD] : undefined;
	} else {
		const fd = await request.formData();
		email = fd.get('email')?.toString();
		token = fd.get(FORM_TOKEN_FIELD)?.toString();
		honeypot = fd.get(HONEYPOT_FIELD)?.toString();
	}

	// Honeypot, signed token, then the durable per-visitor limit — see
	// `form-guard.ts`. The footer's box is on every page, so it is the most
	// reachable write endpoint on the site.
	const guard = await guardValues({
		formName: 'newsletter',
		address: getClientAddress(),
		token,
		honeypot
	});

	if (!guard.ok) {
		// A bot: answer exactly as a success, and drop it.
		if (guard.pretendSuccess) {
			return wantsJson ? json({ ok: true }) : redirect(303, '/?subscribed=1');
		}
		throw error(guard.status, guard.message);
	}

	if (!email?.includes('@')) {
		throw error(400, 'Valid email required');
	}

	try {
		// Records what was agreed to, when, and from where — and mints the
		// unsubscribe token. Signups used to land as plain inquiry rows with no
		// consent evidence and no way out.
		await services.inquiries.subscribeToNewsletter({ email, source: 'footer-form' });
	} catch (err) {
		logger.error('Newsletter', 'signup failed', {
			message: err instanceof Error ? err.message : String(err)
		});
		throw error(500, 'Could not complete the signup. Please try again shortly.');
	}

	if (wantsJson) return json({ ok: true });

	return redirect(303, '/?subscribed=1');
};
