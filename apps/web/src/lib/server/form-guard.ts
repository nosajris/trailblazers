import { FORM_TOKEN_FIELD, STALE_FORM_MESSAGE, throttleMessage } from '@trailblazers/core';
import { services } from './services';

/**
 * One gate in front of every unauthenticated form on the public site.
 *
 * Each of these actions inserts a row on an anonymous POST, and each used to
 * repeat the same three steps by hand: check the honeypot, consume an
 * in-process rate limit, format the throttle message. The limiter's own note
 * said what that was worth — "state lives in the process, so on serverless each
 * instance counts separately and a cold start resets the window" — so a form
 * could be hammered simply by arriving at a fresh instance.
 *
 * Now one call does the lot, and the counting happens in Postgres
 * (`modules/forms`), so the window survives a cold start. The submission must
 * also carry a token this server minted for this form, which turns away the
 * cheap case: a bot POSTing straight at the action without ever loading the
 * page. Minting is `issueFormToken`, called in the route's `load`.
 *
 * The honeypot still wins silently. Telling the author which field gave them
 * away is free help for the next attempt.
 */

export { FORM_TOKEN_FIELD };

/**
 * Name of the decoy field rendered off-screen in public forms. Humans never
 * see it; bots that fill every input give themselves away.
 */
export const HONEYPOT_FIELD = 'website';

export type FormGuardOutcome =
	| { ok: true }
	/** A bot. Answer exactly as a success, and drop the submission. */
	| { ok: false; pretendSuccess: true }
	| { ok: false; pretendSuccess: false; status: number; message: string };

/** Mints the token a form renders in its hidden field. Call this in `load`. */
export function issueFormToken(formName: string): string {
	return services.formGuard.issueToken(formName);
}

/**
 * Checks one submission. `formName` must match the name the token was minted
 * with, or the token is refused — which is what stops a token scraped from the
 * newsletter box being replayed against the prayer form.
 */
export async function guardFormSubmission(
	form: FormData,
	formName: string,
	address: string
): Promise<FormGuardOutcome> {
	return guardValues({
		formName,
		address,
		token: form.get(FORM_TOKEN_FIELD)?.toString(),
		honeypot: form.get(HONEYPOT_FIELD)?.toString()
	});
}

/**
 * The same check for a caller that has the values but no `FormData` — the
 * newsletter endpoint accepts a JSON body as well as a form post.
 */
export async function guardValues(input: {
	formName: string;
	address: string;
	token: string | undefined;
	honeypot?: string | undefined;
}): Promise<FormGuardOutcome> {
	const verdict = await services.formGuard.check(input);

	if (verdict.ok) return { ok: true };

	if (verdict.kind === 'honeypot') return { ok: false, pretendSuccess: true };

	if (verdict.kind === 'throttled') {
		return {
			ok: false,
			pretendSuccess: false,
			status: 429,
			message: throttleMessage(verdict.retryAfterSeconds)
		};
	}

	// A refused token is usually a page left open for days or loaded before a
	// deploy, so this says what to do rather than accusing anyone.
	return { ok: false, pretendSuccess: false, status: 400, message: STALE_FORM_MESSAGE };
}
