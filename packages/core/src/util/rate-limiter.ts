/**
 * Fixed-window rate limiter.
 *
 * Kept free of imports so it stays pure and directly testable; the clock is
 * injectable for the same reason.
 *
 * Scope and limits: state lives in the process, so on serverless each instance
 * counts separately and a cold start resets the window. That still blunts the
 * credential-stuffing and form-spam cases this is here for, but it is NOT a
 * durable limiter. Moving it to Postgres is the follow-up; that needs a new
 * table, and adding one to `packages/core/src/modules/ * /schema.*` currently
 * arms the destructive `db-seed.yml` workflow, so it waits until that job is
 * pinned to a disposable database (see CLAUDE.md).
 */

export type RateLimitResult = {
	/** False when the caller has exhausted the window and should be rejected. */
	allowed: boolean;
	/** Attempts left in the current window, after counting this one. */
	remaining: number;
	/** Seconds until the window resets. 0 while the caller is still allowed. */
	retryAfterSeconds: number;
};

export type RateLimiterOptions = {
	/** Attempts permitted per window. */
	limit: number;
	/** Window length in milliseconds. */
	windowMs: number;
	/** Injectable clock, for tests. Defaults to `Date.now`. */
	now?: () => number;
	/**
	 * Safety valve so a flood of unique keys cannot grow the map without bound.
	 * When exceeded, expired entries are dropped first, then the whole map is
	 * cleared — failing open rather than leaking memory.
	 */
	maxKeys?: number;
};

type Window = { count: number; resetAt: number };

export type RateLimiter = {
	/** Counts one attempt against `key` and reports whether it is allowed. */
	consume(key: string): RateLimitResult;
	/** Reads the current state without counting an attempt. */
	peek(key: string): RateLimitResult;
	/** Forgets `key` — e.g. after a successful login. */
	reset(key: string): void;
	/** Forgets everything. Test helper. */
	clear(): void;
	/** Number of tracked keys. Test helper. */
	size(): number;
};

export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
	const { limit, windowMs } = options;
	const now = options.now ?? (() => Date.now());
	const maxKeys = options.maxKeys ?? 10_000;

	if (limit < 1) throw new Error('rate limiter: limit must be at least 1');
	if (windowMs < 1) throw new Error('rate limiter: windowMs must be at least 1');

	const windows = new Map<string, Window>();

	function prune(at: number): void {
		for (const [key, window] of windows) {
			if (window.resetAt <= at) windows.delete(key);
		}
	}

	function secondsUntil(resetAt: number, at: number): number {
		return Math.max(0, Math.ceil((resetAt - at) / 1000));
	}

	return {
		consume(key: string): RateLimitResult {
			const at = now();

			if (windows.size >= maxKeys) {
				prune(at);
				if (windows.size >= maxKeys) windows.clear();
			}

			const existing = windows.get(key);

			if (!existing || existing.resetAt <= at) {
				const resetAt = at + windowMs;
				windows.set(key, { count: 1, resetAt });
				return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
			}

			existing.count += 1;

			if (existing.count > limit) {
				return {
					allowed: false,
					remaining: 0,
					retryAfterSeconds: secondsUntil(existing.resetAt, at)
				};
			}

			return {
				allowed: true,
				remaining: limit - existing.count,
				retryAfterSeconds: 0
			};
		},

		peek(key: string): RateLimitResult {
			const at = now();
			const existing = windows.get(key);

			if (!existing || existing.resetAt <= at) {
				return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
			}

			const used = existing.count;
			if (used >= limit) {
				return {
					allowed: false,
					remaining: 0,
					retryAfterSeconds: secondsUntil(existing.resetAt, at)
				};
			}

			return { allowed: true, remaining: limit - used, retryAfterSeconds: 0 };
		},

		reset(key: string): void {
			windows.delete(key);
		},

		clear(): void {
			windows.clear();
		},

		size(): number {
			return windows.size;
		}
	};
}
