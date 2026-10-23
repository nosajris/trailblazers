/**
 * Signed form tokens, and the pure half of the submission rate limit.
 *
 * What this adds to the defences already on the public forms (an off-screen
 * honeypot field, checked in every action): a submission must now carry a token
 * this server minted, for this form. A bot that POSTs straight at the endpoint
 * without ever fetching the page — the cheap, high-volume case — has nothing to
 * send, and a token scraped from one form cannot be replayed against another.
 *
 * What it deliberately does *not* claim. A public form page is served through
 * the CDN (`s-maxage=3600, stale-while-revalidate=86400`), so the token in the
 * HTML is minted when the cache entry was filled, not when the visitor opened
 * the page: every visitor of a cached page shares one token, and its age says
 * nothing about how long they took to type. So there is no "submitted too fast"
 * check by default, and the validity window has to outlast the cache rather
 * than the visitor's attention span. A form on an uncached page can opt into
 * the timing check with `minAgeMs`.
 *
 * Imports are limited to `node:crypto`, like `iam/session-tokens.ts`, so the
 * module stays directly testable with no database or framework in the way.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

/** The hidden input every public form carries. */
export const FORM_TOKEN_FIELD = '_ft';

/**
 * How long a minted token stays valid: comfortably longer than the 25 hours a
 * `static` page can live in the CDN (3600s fresh + 86400s stale-while-
 * revalidate), or visitors of a cached page would be refused through no fault
 * of their own. `form-token.test.ts` asserts that relationship.
 */
export const MAX_TOKEN_AGE_MS = 48 * 60 * 60 * 1000;

/** Tolerance for a server clock slightly ahead of the one that minted. */
const CLOCK_SKEW_MS = 5 * 60 * 1000;

export type FormTokenCheck =
	| { ok: true }
	| { ok: false; reason: 'missing' | 'malformed' | 'tampered' | 'stale' | 'premature' };

function sign(secret: string, formName: string, issuedAtMs: number): string {
	return createHmac('sha256', secret).update(`${formName}|${issuedAtMs}`).digest('hex');
}

function signaturesMatch(a: string, b: string): boolean {
	const left = Buffer.from(a, 'utf8');
	const right = Buffer.from(b, 'utf8');
	if (left.length !== right.length) return false;
	return timingSafeEqual(left, right);
}

/**
 * Mints a token for one form, to be rendered into its HTML.
 *
 * The form's name is part of the signature, so the token is only good for that
 * form.
 */
export function createFormToken(secret: string, formName: string, now: Date = new Date()): string {
	const issuedAtMs = now.getTime();
	return `${issuedAtMs}.${sign(secret, formName, issuedAtMs)}`;
}

export type VerifyOptions = {
	maxAgeMs?: number;
	/**
	 * Reject a submission that arrives sooner than this after the token was
	 * minted. Only meaningful where the page is not shared-cached — see the
	 * module note.
	 */
	minAgeMs?: number;
};

/** Checks a submitted token against the form it claims to belong to. */
export function verifyFormToken(
	secret: string,
	formName: string,
	token: string | undefined | null,
	now: Date = new Date(),
	options: VerifyOptions = {}
): FormTokenCheck {
	if (token === undefined || token === null || token.trim() === '') {
		return { ok: false, reason: 'missing' };
	}

	const [issuedAtPart, signature] = token.trim().split('.');
	if (!issuedAtPart || !signature) return { ok: false, reason: 'malformed' };

	const issuedAtMs = Number(issuedAtPart);
	if (!Number.isFinite(issuedAtMs)) return { ok: false, reason: 'malformed' };

	if (!signaturesMatch(signature, sign(secret, formName, issuedAtMs))) {
		return { ok: false, reason: 'tampered' };
	}

	const age = now.getTime() - issuedAtMs;

	// A token stamped well into the future was not minted by a clock we trust.
	if (age < -CLOCK_SKEW_MS) return { ok: false, reason: 'tampered' };
	if (age > (options.maxAgeMs ?? MAX_TOKEN_AGE_MS)) return { ok: false, reason: 'stale' };
	if (options.minAgeMs !== undefined && age < options.minAgeMs) {
		return { ok: false, reason: 'premature' };
	}

	return { ok: true };
}

export type RateCounter = {
	/** Submissions counted in the current window, including this one. */
	count: number;
	windowStartedAt: Date;
};

export type RateLimitOptions = {
	limit: number;
	windowMs: number;
};

export type RateDecision = {
	allowed: boolean;
	/** Seconds until the window resets. 0 while the caller is still allowed. */
	retryAfterSeconds: number;
};

/**
 * Turns a counter row into a verdict.
 *
 * Split out from the SQL on purpose: the counter is incremented by one atomic
 * upsert (so two submissions racing cannot both read "0"), and this decides
 * what the resulting number means — which keeps the arithmetic, including the
 * retry-after the visitor is shown, testable without a database.
 */
export function decideFromCounter(
	counter: RateCounter,
	now: Date,
	options: RateLimitOptions
): RateDecision {
	if (counter.count <= options.limit) return { allowed: true, retryAfterSeconds: 0 };

	const elapsed = now.getTime() - counter.windowStartedAt.getTime();
	const remaining = Math.max(0, options.windowMs - elapsed);

	return { allowed: false, retryAfterSeconds: Math.ceil(remaining / 1000) };
}
