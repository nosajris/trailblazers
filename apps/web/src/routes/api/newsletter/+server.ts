import { services } from '$lib/server/services';
import { json, redirect, error } from '@sveltejs/kit';
import { logger } from '@trailblazers/core';
import {
	consumeFormSubmission,
	isHoneypotTripped,
	throttleMessage
} from '$lib/server/rate-limit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	let email: string | undefined;
	let honeypotTripped = false;

	const ct = request.headers.get('content-type') ?? '';
	const wantsJson =
		ct.includes('application/json') || request.headers.get('accept')?.includes('application/json');

	if (ct.includes('application/json')) {
		const body = await request.json().catch(() => null);
		email = typeof body?.email === 'string' ? body.email : undefined;
	} else {
		const fd = await request.formData();
		email = fd.get('email')?.toString();
		honeypotTripped = isHoneypotTripped(fd);
	}

	// Accept and drop, rather than naming the decoy field.
	if (honeypotTripped) {
		logger.warn('Newsletter', 'honeypot tripped', { address: getClientAddress() });
		return wantsJson ? json({ ok: true }) : redirect(303, '/?subscribed=1');
	}

	const throttle = consumeFormSubmission(getClientAddress(), 'newsletter');
	if (!throttle.allowed) {
		throw error(429, throttleMessage(throttle.retryAfterSeconds));
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
