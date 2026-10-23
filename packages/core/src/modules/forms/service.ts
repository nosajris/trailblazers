import { createHmac } from 'node:crypto';
import type { Database } from '../../db/client.js';
import { assertUsableSecret } from '../iam/session-tokens.js';
import { logger } from '../../logger.js';
import { createFormGuardRepository } from './repository.js';
import {
	createFormToken,
	decideFromCounter,
	verifyFormToken,
	type VerifyOptions
} from './form-token.js';

/** Submissions one visitor may make to one form inside the window. */
export const DEFAULT_LIMIT = 5;
export const DEFAULT_WINDOW_MS = 10 * 60 * 1000;

/** How long a closed counter is kept before the daily cron drops it. */
export const COUNTER_RETENTION_MS = 24 * 60 * 60 * 1000;

export type FormGuardConfig = {
	/** Keys both the form tokens and the hashing of submitter addresses. */
	secretKey: string | undefined;
	limit?: number;
	windowMs?: number;
};

export type GuardVerdict =
	| { ok: true }
	/** The decoy field came back filled: a bot. Accept and drop, silently. */
	| { ok: false; kind: 'honeypot' }
	| { ok: false; kind: 'token'; reason: string }
	| { ok: false; kind: 'throttled'; retryAfterSeconds: number };

export type GuardInput = {
	/** Which form this is, as used when the token was minted. */
	formName: string;
	/** `getClientAddress()`. Hashed before it is stored or logged. */
	address: string;
	token: string | undefined | null;
	/** Whatever came back in the honeypot field. */
	honeypot?: string | undefined | null;
	now?: Date;
	/** Per-form overrides, e.g. `minAgeMs` on a page that is never cached. */
	tokenOptions?: VerifyOptions;
};

/**
 * One gate for every public form: honeypot, signed token, then a durable
 * per-visitor rate limit.
 *
 * The order is the point. The honeypot and the token cost nothing to check, so
 * a flood of forged POSTs is turned away before it can write a counter row —
 * otherwise the defence against spam would itself be a way to make the database
 * do work.
 */
export function createFormGuardService(db: Database, config: FormGuardConfig) {
	const repo = createFormGuardRepository(db);
	const limit = config.limit ?? DEFAULT_LIMIT;
	const windowMs = config.windowMs ?? DEFAULT_WINDOW_MS;

	function secret(): string {
		// A silently-undefined HMAC key is configuration that looks like a
		// security control and is not one, so this fails loudly instead.
		assertUsableSecret(config.secretKey);
		return config.secretKey;
	}

	/**
	 * Identifies a visitor's counter without storing their address: the raw
	 * address is hashed with the same secret that keys sessions, so the table
	 * holds a hash that cannot be read back into an IP.
	 */
	function counterKey(formName: string, address: string): string {
		return createHmac('sha256', secret()).update(`${formName}|${address}`).digest('hex');
	}

	return {
		/**
		 * Mints the token a form renders in its hidden `_ft` field. `now`
		 * defaults to the real clock; tests pass a fixed one so minting and
		 * verification agree on what time it is.
		 */
		issueToken(formName: string, now: Date = new Date()): string {
			return createFormToken(secret(), formName, now);
		},

		async check(input: GuardInput): Promise<GuardVerdict> {
			const now = input.now ?? new Date();

			if (typeof input.honeypot === 'string' && input.honeypot.trim().length > 0) {
				logger.warn('FormGuard', 'honeypot tripped', { form: input.formName });
				return { ok: false, kind: 'honeypot' };
			}

			const token = verifyFormToken(secret(), input.formName, input.token, now, input.tokenOptions);
			if (!token.ok) {
				logger.warn('FormGuard', 'token refused', {
					form: input.formName,
					reason: token.reason
				});
				return { ok: false, kind: 'token', reason: token.reason };
			}

			const counter = await repo.countSubmission(
				counterKey(input.formName, input.address),
				now,
				windowMs
			);
			const decision = decideFromCounter(counter, now, { limit, windowMs });

			if (!decision.allowed) {
				logger.warn('FormGuard', 'throttled', { form: input.formName });
				return {
					ok: false,
					kind: 'throttled',
					retryAfterSeconds: decision.retryAfterSeconds
				};
			}

			return { ok: true };
		},

		/** Daily cleanup of counters whose window closed a day or more ago. */
		async pruneCounters(now: Date = new Date()): Promise<void> {
			await repo.prune(new Date(now.getTime() - COUNTER_RETENTION_MS));
		}
	};
}

/** Friendly wording for a throttled submission. */
export function throttleMessage(retryAfterSeconds: number): string {
	const minutes = Math.ceil(retryAfterSeconds / 60);
	return `Too many submissions. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}

/**
 * What a visitor is told when their token is missing or stale — most often a
 * page left open for days, or one loaded before a deploy.
 */
export const STALE_FORM_MESSAGE =
	'That form had been open a while. Please reload the page and send it again.';
