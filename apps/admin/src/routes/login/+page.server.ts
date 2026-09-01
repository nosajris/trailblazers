import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { logger } from '@trailblazers/core';
import type { Actions } from './$types';
import { services } from '$lib/server/services.js';
import { SESSION_COOKIE } from '$lib/server/auth-constants.js';
import { canAccessAdmin } from '$lib/server/auth.js';
import { clearLoginAttempts, consumeLoginAttempt } from '$lib/server/rate-limit.js';

/**
 * A real bcrypt hash of a throwaway string, compared against when no account
 * matches. Without it, an unknown email returns far faster than a known one
 * and the response time alone reveals which addresses exist.
 */
const TIMING_EQUALIZER_HASH = '$2a$10$id..FmaoTmccS57PmYrRVuFjRG4OUCrRJoQ9ZD9AVrsV74.TLFwKK';

/** One message for both "no such account" and "wrong password". */
const INVALID_CREDENTIALS = 'Invalid email or password.';

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const form = await request.formData();
		const email = form.get('email')?.toString().trim();
		const password = form.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		const address = getClientAddress();
		const throttle = consumeLoginAttempt(address, email);

		if (!throttle.allowed) {
			const minutes = Math.ceil(throttle.retryAfterSeconds / 60);
			logger.warn('AdminLogin', 'rate limited', { address });
			return fail(429, {
				error: `Too many sign-in attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`
			});
		}

		try {
			const user = await services.iam.getUserByEmail(email);

			// Always run a comparison, even with no user, so both paths cost the
			// same and the error below is the same.
			const hash = user?.passwordHash || TIMING_EQUALIZER_HASH;
			const passwordMatches = await bcrypt.compare(password, hash);

			if (!user || !passwordMatches) {
				logger.warn('AdminLogin', 'failed attempt', { address });
				return fail(400, { error: INVALID_CREDENTIALS });
			}

			if (!canAccessAdmin(user.role || undefined)) {
				logger.warn('AdminLogin', 'denied non-staff role', { userId: user.id });
				return fail(403, { error: 'Access denied. Staff privileges required.' });
			}

			// A fresh token per sign-in — the identifier is never carried across an
			// authentication boundary. Only its HMAC reaches the database.
			const { token, expiresAt } = await services.iam.startSession(user.id);

			// Opportunistic sweep: expired rows used to accumulate forever, since
			// nothing ever deleted them. Login is rare enough to carry this.
			services.iam
				.deleteExpiredSessions()
				.catch((err) => logger.warn('AdminLogin', 'session sweep failed', { message: String(err) }));

			await services.auditLogs.logAction(
				'LOGIN',
				'USER',
				String(user.id),
				`Staff logged in: ${user.email}`,
				user.id,
				user.fullName
			);

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
			// Postgres errors carry host, database and role names — log them, never
			// render them.
			logger.error('AdminLogin', 'unexpected failure', {
				message: err instanceof Error ? err.message : String(err)
			});
			return fail(500, { error: 'Sign-in is unavailable right now. Please try again shortly.' });
		}

		throw redirect(303, '/');
	}
};
