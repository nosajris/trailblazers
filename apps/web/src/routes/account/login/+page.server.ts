import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { logger, throttleMessage } from '@trailblazers/core';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';
import { SESSION_COOKIE } from '$lib/server/auth-constants.js';
import { consumeLoginAttempt, clearLoginAttempts } from '$lib/server/account-rate-limit.js';

/**
 * A real bcrypt hash of a throwaway string, compared against when no account
 * matches. Without it, an unknown email returns far faster than a known one
 * and the response time alone reveals which addresses have accounts. Same
 * technique as `apps/admin/src/routes/login/+page.server.ts` — a fresh hash,
 * not shared with it, since there is no reason the two ever need to match.
 */
const TIMING_EQUALIZER_HASH = '$2a$10$18UzgMNqxsiS98VfDiO.HeC8/m3n40uQKpqNIzIdOATrI2o.lONlm';

const INVALID_CREDENTIALS = 'Incorrect email or password.';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		throw redirect(303, url.searchParams.get('next') || '/account');
	}
	return {
		settings: await services.settings.getBundle(),
		next: url.searchParams.get('next') || '/account'
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress, url }) => {
		const form = await request.formData();
		const email = form.get('email')?.toString().trim();
		const password = form.get('password')?.toString();
		const next = form.get('next')?.toString() || url.searchParams.get('next') || '/account';

		if (!email || !password) {
			return fail(400, { error: 'Enter your email and password.' });
		}

		const address = getClientAddress();
		const throttle = consumeLoginAttempt(address, email);

		if (!throttle.allowed) {
			logger.warn('AccountLogin', 'rate limited', { address });
			return fail(429, { error: throttleMessage(throttle.retryAfterSeconds) });
		}

		try {
			const user = await services.iam.getUserByEmail(email);

			// Always run a comparison, even with no user, so both paths cost the
			// same and the error below is the same.
			const hash = user?.passwordHash || TIMING_EQUALIZER_HASH;
			const passwordMatches = await bcrypt.compare(password, hash);

			if (!user || !passwordMatches) {
				return fail(400, { error: INVALID_CREDENTIALS });
			}

			const { token, expiresAt } = await services.iam.startSession(user.id);

			services.iam
				.deleteExpiredSessions()
				.catch((err) => logger.warn('AccountLogin', 'session sweep failed', { message: String(err) }));

			clearLoginAttempts(address, email);

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
			logger.error('AccountLogin', 'unexpected failure', {
				message: err instanceof Error ? err.message : String(err)
			});
			return fail(500, { error: 'Sign-in is unavailable right now. Please try again shortly.' });
		}

		throw redirect(303, next);
	}
};
