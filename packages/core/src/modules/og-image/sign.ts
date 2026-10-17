/**
 * Signs the parameters for a generated OG image, so `/og` only ever draws
 * text that a page on this site actually asked for — without it, the route
 * would be a public "render arbitrary text under our branding" generator for
 * anyone who finds the URL pattern.
 *
 * Adapted from Strata's `og.js` (the same canonical-string-then-HMAC shape),
 * trimmed to the one card template this site uses.
 */
import crypto from 'node:crypto';

export type OgCardParams = { title: string; kicker: string };

function canonical(params: OgCardParams): string {
	return `og:${params.title}\n${params.kicker}`;
}

/** The HMAC for `params`, truncated the same way on both sign and verify. */
export function signOgParams(secretKey: string, params: OgCardParams): string {
	return crypto.createHmac('sha256', secretKey).update(canonical(params)).digest('hex').slice(0, 24);
}

/** Constant-time compare — a signature check is exactly the place a timing side-channel would matter. */
export function verifyOgParams(secretKey: string, params: OgCardParams, signature: string): boolean {
	const want = Buffer.from(signOgParams(secretKey, params));
	const got = Buffer.from(String(signature ?? ''));
	return want.length === got.length && crypto.timingSafeEqual(want, got);
}

/** The full `/og` URL for these params, signed — what a page's own server load passes down as its OG image. */
export function ogImageUrl(siteUrl: string, secretKey: string, params: OgCardParams): string {
	const query = new URLSearchParams({
		title: params.title,
		kicker: params.kicker,
		sig: signOgParams(secretKey, params)
	});
	return `${siteUrl}/og?${query.toString()}`;
}
