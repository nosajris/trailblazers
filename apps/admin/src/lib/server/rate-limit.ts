import { createRateLimiter } from '@trailblazers/core';

/**
 * Login throttling.
 *
 * Two windows, both of which must allow the attempt:
 *  - per IP + email, so one account cannot be ground down;
 *  - per IP, so an attacker cannot spread attempts across many accounts.
 *
 * State is per process (see the note in `packages/core/src/util/rate-limiter.ts`),
 * so this is a speed bump for online guessing rather than a hard guarantee.
 */
const FIFTEEN_MINUTES = 15 * 60 * 1000;

const perAccount = createRateLimiter({ limit: 5, windowMs: FIFTEEN_MINUTES });
const perAddress = createRateLimiter({ limit: 20, windowMs: FIFTEEN_MINUTES });

export type LoginThrottle = { allowed: boolean; retryAfterSeconds: number };

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

/** Counts a login attempt. Call once per submitted form. */
export function consumeLoginAttempt(address: string, email: string): LoginThrottle {
	const account = perAccount.consume(`${address}|${normalizeEmail(email)}`);
	const source = perAddress.consume(address);

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
	perAccount.reset(`${address}|${normalizeEmail(email)}`);
}
