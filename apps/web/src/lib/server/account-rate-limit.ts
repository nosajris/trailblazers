import { createRateLimiter } from '@trailblazers/core';

/**
 * Throttling for the public member-account sign-in and sign-up forms.
 *
 * Mirrors the admin portal's login throttle (`apps/admin/src/lib/server/rate-limit.ts`):
 * two windows, both of which must allow the attempt — per IP + email, so one
 * account cannot be ground down, and per IP, so an attacker cannot spread
 * attempts across many addresses. Kept separate from `rate-limit.ts` (click
 * tracking) and from `form-guard.ts` (the honeypot + Postgres-backed throttle
 * used by the site's anonymous contact/prayer/etc. forms) because a credential
 * check is a different kind of abuse than a spam submission.
 *
 * State is per process, so this is a speed bump for online guessing rather
 * than a hard guarantee — the same trade-off the admin limiter documents.
 */
const FIFTEEN_MINUTES = 15 * 60 * 1000;

const perAccountLogin = createRateLimiter({ limit: 5, windowMs: FIFTEEN_MINUTES });
const perAddressLogin = createRateLimiter({ limit: 20, windowMs: FIFTEEN_MINUTES });

// Signup abuse looks different (mass account creation, not password guessing),
// so it gets its own, more permissive windows rather than sharing the login
// limiter's counters.
const perAddressSignup = createRateLimiter({ limit: 8, windowMs: FIFTEEN_MINUTES });

export type AccountThrottle = { allowed: boolean; retryAfterSeconds: number };

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

/** Counts a login attempt. Call once per submitted form. */
export function consumeLoginAttempt(address: string, email: string): AccountThrottle {
	const account = perAccountLogin.consume(`${address}|${normalizeEmail(email)}`);
	const source = perAddressLogin.consume(address);

	if (account.allowed && source.allowed) {
		return { allowed: true, retryAfterSeconds: 0 };
	}

	return {
		allowed: false,
		retryAfterSeconds: Math.max(account.retryAfterSeconds, source.retryAfterSeconds)
	};
}

/** Clears the per-account window after a successful sign-in. */
export function clearLoginAttempts(address: string, email: string): void {
	perAccountLogin.reset(`${address}|${normalizeEmail(email)}`);
}

/** Counts a signup attempt. Call once per submitted form. */
export function consumeSignupAttempt(address: string): AccountThrottle {
	return perAddressSignup.consume(address);
}
