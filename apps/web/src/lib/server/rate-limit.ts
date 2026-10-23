import { createRateLimiter } from '@trailblazers/core';

/**
 * In-process throttling for `/api/track-click`.
 *
 * The public *forms* moved to `form-guard.ts`, whose counters live in Postgres
 * so a cold start cannot reset them. Click tracking stays here on purpose: it
 * is the highest-volume endpoint on the site and a durable counter would mean a
 * database write per click, which costs more than the abuse it would prevent.
 * Losing a window on a cold start is the right trade for an analytics beacon.
 */
const TEN_MINUTES = 10 * 60 * 1000;

const beacons = createRateLimiter({ limit: 5, windowMs: TEN_MINUTES });

export type FormThrottle = { allowed: boolean; retryAfterSeconds: number };

/** Counts one call of `formName` from `address`. */
export function consumeFormSubmission(address: string, formName: string): FormThrottle {
	const result = beacons.consume(`${formName}|${address}`);
	return { allowed: result.allowed, retryAfterSeconds: result.retryAfterSeconds };
}
