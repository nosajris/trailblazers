import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { logger, throttleMessage } from '@trailblazers/core';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';
import { SESSION_COOKIE } from '$lib/server/auth-constants.js';
import { guardFormSubmission, issueFormToken } from '$lib/server/form-guard.js';
import { consumeSignupAttempt } from '$lib/server/account-rate-limit.js';

/** Matches the convention in `apps/admin/src/routes/set-password/+page.server.ts`. */
const MIN_PASSWORD_LENGTH = 12;

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/account');
	}
	return {
		settings: await services.settings.getBundle(),
		formToken: issueFormToken('account-signup')
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const form = await request.formData();

		const guard = await guardFormSubmission(form, 'account-signup', getClientAddress());
		if (!guard.ok) {
			// A bot tripped the decoy field: answer as a success and drop it,
			// rather than naming the field that gave it away.
			if (guard.pretendSuccess) throw redirect(303, '/account/login');
			return fail(guard.status, { error: guard.message });
		}

		const address = getClientAddress();
		const signupThrottle = consumeSignupAttempt(address);
		if (!signupThrottle.allowed) {
			logger.warn('AccountSignup', 'rate limited', { address });
			return fail(429, { error: throttleMessage(signupThrottle.retryAfterSeconds) });
		}

		const fullName = form.get('fullName')?.toString().trim();
		const email = form.get('email')?.toString().trim().toLowerCase();
		const password = form.get('password')?.toString() ?? '';
		const confirmPassword = form.get('confirmPassword')?.toString() ?? '';

		if (!fullName || !email) {
			return fail(400, { error: 'Enter your name and email.' });
		}

		if (!email.includes('@') || !email.includes('.')) {
			return fail(400, { error: 'Enter a valid email address.' });
		}

		if (password.length < MIN_PASSWORD_LENGTH) {
			return fail(400, { error: `Choose a password of at least ${MIN_PASSWORD_LENGTH} characters.` });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'The two passwords do not match.' });
		}

		try {
			const user = await services.iam.saveUser({
				fullName,
				email,
				role: 'MEMBER',
				passwordHash: await bcrypt.hash(password, 12)
			});

			const { token, expiresAt } = await services.iam.startSession(user.id);

			cookies.set(SESSION_COOKIE, token, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production',
				expires: expiresAt
			});
		} catch (err) {
			if (err && typeof err === 'object' && ('status' in err || 'location' in err)) {
				throw err; // Re-throw SvelteKit redirects
			}
			// A duplicate email trips the table's unique constraint — Postgres
			// error code 23505 — rather than anything we check for up front, so
			// an existing account isn't confirmed to exist before this point.
			const code = (err as { code?: string } | null)?.code;
			if (code === '23505') {
				return fail(400, { error: 'An account with that email already exists. Try signing in instead.' });
			}
			logger.error('AccountSignup', 'unexpected failure', {
				message: err instanceof Error ? err.message : String(err)
			});
			return fail(500, { error: 'Could not create your account right now. Please try again shortly.' });
		}

		throw redirect(303, '/account');
	}
};
