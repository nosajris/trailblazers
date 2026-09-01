/**
 * Session token minting and hashing.
 *
 * The cookie carries a random token. The database stores only an HMAC of it,
 * keyed by SECRET_KEY, so a leaked backup, log line or SQL-injection read
 * yields hashes that cannot be replayed as sessions.
 *
 * This is what SECRET_KEY is for. It was previously declared in `.env`,
 * `.env.example`, `turbo.json` and both CI workflows while no code read it —
 * configuration that looked like a security control but was not one.
 *
 * Imports are limited to `node:crypto` so the module stays directly testable.
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/** Length of the raw token handed to the browser, in bytes before encoding. */
const TOKEN_BYTES = 32;

export type SessionTokenPair = {
	/** Goes in the cookie. Never stored. */
	token: string;
	/** Goes in the database. Never leaves the server. */
	tokenHash: string;
};

/**
 * Fails loudly on a missing or placeholder key rather than silently hashing
 * with a guessable one.
 */
export function assertUsableSecret(secret: string | undefined): asserts secret is string {
	if (!secret || secret.trim().length === 0) {
		throw new Error(
			'[Session] SECRET_KEY is not set. It keys the HMAC that protects session tokens at rest.'
		);
	}

	if (secret.length < 32) {
		throw new Error(
			'[Session] SECRET_KEY is too short — use at least 32 characters of high-entropy random data.'
		);
	}

	if (secret === 'super_secret_production_key_change_me') {
		throw new Error(
			'[Session] SECRET_KEY is still the example value from .env.example. Generate a real one.'
		);
	}
}

/** Derives the stored form of a token. Same input always gives the same hash. */
export function hashSessionToken(token: string, secret: string): string {
	assertUsableSecret(secret);
	return createHmac('sha256', secret).update(token).digest('hex');
}

/** Mints a fresh token and its stored hash. */
export function createSessionToken(secret: string): SessionTokenPair {
	assertUsableSecret(secret);
	const token = randomBytes(TOKEN_BYTES).toString('base64url');
	return { token, tokenHash: hashSessionToken(token, secret) };
}

/** Constant-time comparison, for callers that need to compare two hashes. */
export function hashesMatch(a: string, b: string): boolean {
	const left = Buffer.from(a, 'utf8');
	const right = Buffer.from(b, 'utf8');
	if (left.length !== right.length) return false;
	return timingSafeEqual(left, right);
}

export type SessionWindow = {
	/** When the session was first created. */
	createdAt: Date;
	/** When it currently expires. */
	expiresAt: Date;
};

/** How long a session lives without activity. */
export const IDLE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Hard ceiling on a session's age, however active it is. */
export const ABSOLUTE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Only write a new expiry when the remaining idle window has dropped below
 * this fraction. Sliding expiry on every request would mean a database write
 * per request; this keeps the behaviour while writing rarely.
 */
const REFRESH_THRESHOLD = 0.5;

export type RefreshDecision =
	| { action: 'expired' }
	| { action: 'keep' }
	| { action: 'extend'; expiresAt: Date };

/**
 * Decides what to do with a session presented at time `now`.
 *
 * - past its absolute age, or past its expiry -> expired
 * - more than half the idle window left -> keep, no write
 * - otherwise -> extend, clamped to the absolute ceiling
 */
export function decideRefresh(
	window: SessionWindow,
	now: Date,
	idleTtlMs: number = IDLE_TTL_MS,
	absoluteTtlMs: number = ABSOLUTE_TTL_MS
): RefreshDecision {
	const nowMs = now.getTime();
	const expiresMs = window.expiresAt.getTime();
	const absoluteDeadlineMs = window.createdAt.getTime() + absoluteTtlMs;

	if (nowMs >= expiresMs) return { action: 'expired' };
	if (nowMs >= absoluteDeadlineMs) return { action: 'expired' };

	const remaining = expiresMs - nowMs;
	if (remaining > idleTtlMs * REFRESH_THRESHOLD) return { action: 'keep' };

	const proposed = nowMs + idleTtlMs;
	const clamped = Math.min(proposed, absoluteDeadlineMs);

	// Never move an expiry backwards.
	if (clamped <= expiresMs) return { action: 'keep' };

	return { action: 'extend', expiresAt: new Date(clamped) };
}
