import { createRateLimiter } from '@trailblazers/core';

/**
 * Throttling for the unauthenticated write endpoints — contact, newsletter,
 * volunteer and visit forms. All four insert rows on an anonymous POST.
 *
 * State is per process (see `packages/core/src/util/rate-limiter.ts`), so treat
 * this as spam friction rather than a guarantee.
 */
const TEN_MINUTES = 10 * 60 * 1000;

const publicForms = createRateLimiter({ limit: 5, windowMs: TEN_MINUTES });

export type FormThrottle = { allowed: boolean; retryAfterSeconds: number };

/** Counts one submission of `formName` from `address`. */
export function consumeFormSubmission(address: string, formName: string): FormThrottle {
	const result = publicForms.consume(`${formName}|${address}`);
	return { allowed: result.allowed, retryAfterSeconds: result.retryAfterSeconds };
}

/**
 * Name of the decoy field rendered off-screen in public forms. Humans never
 * see it; bots that fill every input give themselves away.
 */
export const HONEYPOT_FIELD = 'website';

/** True when the decoy field came back with anything in it. */
export function isHoneypotTripped(form: FormData): boolean {
	const value = form.get(HONEYPOT_FIELD);
	return typeof value === 'string' && value.trim().length > 0;
}

/** Friendly wording for a throttled submission. */
export function throttleMessage(retryAfterSeconds: number): string {
	const minutes = Math.ceil(retryAfterSeconds / 60);
	return `Too many submissions. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}
