import { and, count, eq, gt, isNotNull, isNull, lt, ne, or } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import type { Database } from '../../db/client.js';
import { users, sessions, passwordTokens } from './schema.js';
import { toPublicUser } from './mappers.js';
import { PolicyError } from './permissions.js';
import {
	IDLE_TTL_MS,
	createSessionToken,
	decideRefresh,
	hashSessionToken
} from './session-tokens.js';
import type { PublicUserVm } from './types.js';

export type IamConfig = {
	/** Keys the HMAC protecting session and password tokens at rest. */
	secretKey: string | undefined;
};

/**
 * Placeholder written to `password_hash` for an account that has not set one.
 *
 * It is random and is not a bcrypt hash, so `bcrypt.compare` against it always
 * returns false. The previous sentinel, the literal `'pbkdf2:default'`, had the
 * same effect by accident but read like a real algorithm, and left no way for
 * the account to ever sign in.
 */
function unusablePasswordHash(): string {
	return `unset:${randomBytes(24).toString('hex')}`;
}

/** How long an invite or reset link stays valid. */
const PASSWORD_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

export function createIamService(db: Database, config: IamConfig) {
	function secret(): string {
		// Read lazily: this module is imported during the build, where no
		// environment is configured, but nothing calls these paths there.
		return config.secretKey as string;
	}

	/** How many ADMIN accounts exist. */
	async function countAdmins(): Promise<number> {
		const rows = await db.select({ value: count() }).from(users).where(eq(users.role, 'ADMIN'));
		return rows[0]?.value ?? 0;
	}

	/** True when `id` is an ADMIN and no other ADMIN account exists. */
	async function isLastAdmin(id: number): Promise<boolean> {
		const target = await db.query.users.findFirst({ where: eq(users.id, id) });
		if (!target || target.role !== 'ADMIN') return false;

		const others = await db
			.select({ value: count() })
			.from(users)
			.where(and(eq(users.role, 'ADMIN'), ne(users.id, id)));

		return (others[0]?.value ?? 0) === 0;
	}

	return {
		countAdmins,
		isLastAdmin,

		async getUserByEmail(email: string) {
			return db.query.users.findFirst({ where: eq(users.email, email) });
		},

		async getUserById(id: number) {
			return db.query.users.findFirst({ where: eq(users.id, id) });
		},

		async getPublicUserById(id: number): Promise<PublicUserVm | null> {
			const row = await db.query.users.findFirst({ where: eq(users.id, id) });
			return row ? toPublicUser(row) : null;
		},

		/**
		 * Mints a session and returns the raw token for the cookie. Only its
		 * HMAC reaches the database.
		 *
		 * Every sign-in issues a fresh token, so a session identifier is never
		 * reused across an authentication boundary.
		 */
		async startSession(userId: number): Promise<{ token: string; expiresAt: Date }> {
			const { token, tokenHash } = createSessionToken(secret());
			const now = new Date();
			const expiresAt = new Date(now.getTime() + IDLE_TTL_MS);

			await db.insert(sessions).values({ id: tokenHash, userId, createdAt: now, expiresAt });

			return { token, expiresAt };
		},

		/** Ends one session, given the cookie's raw token. */
		async endSession(token: string): Promise<void> {
			await db.delete(sessions).where(eq(sessions.id, hashSessionToken(token, secret())));
		},

		/** Ends every session belonging to a user — used after a password change. */
		async endAllSessionsForUser(userId: number): Promise<void> {
			await db.delete(sessions).where(eq(sessions.userId, userId));
		},

		/**
		 * Deletes expired rows. Sessions were previously filtered at read time
		 * but never removed, so the table grew without bound.
		 */
		async deleteExpiredSessions(): Promise<void> {
			await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
		},

		/**
		 * Resolves a cookie token to its user, applying the sliding window.
		 *
		 * Runs on every authenticated request in both apps (see
		 * `hooks.server.ts`), so it stays a single join, and it only writes when
		 * the expiry actually needs moving.
		 */
		async validateSession(token: string): Promise<PublicUserVm | null> {
			const tokenHash = hashSessionToken(token, secret());
			const now = new Date();

			const rows = await db
				.select({ user: users, session: sessions })
				.from(sessions)
				.innerJoin(users, eq(sessions.userId, users.id))
				.where(and(eq(sessions.id, tokenHash), gt(sessions.expiresAt, now)))
				.limit(1);

			const row = rows[0];
			if (!row) return null;

			const decision = decideRefresh(
				{ createdAt: row.session.createdAt, expiresAt: row.session.expiresAt },
				now
			);

			if (decision.action === 'expired') {
				// Past the absolute ceiling: drop it rather than leaving a row that
				// the query above would keep matching until its idle expiry.
				await db.delete(sessions).where(eq(sessions.id, tokenHash));
				return null;
			}

			if (decision.action === 'extend') {
				await db
					.update(sessions)
					.set({ expiresAt: decision.expiresAt })
					.where(eq(sessions.id, tokenHash));
			}

			return toPublicUser(row.user);
		},

		/**
		 * Issues a single-use link for setting a password, invalidating any
		 * outstanding one for that account. Returns the raw token; only its HMAC
		 * is stored.
		 */
		async issuePasswordToken(
			userId: number,
			purpose: 'INVITE' | 'RESET'
		): Promise<{ token: string; expiresAt: Date }> {
			const { token, tokenHash } = createSessionToken(secret());
			const expiresAt = new Date(Date.now() + PASSWORD_TOKEN_TTL_MS);

			// One live link per account: issuing a new one retires the rest.
			await db.delete(passwordTokens).where(
				and(eq(passwordTokens.userId, userId), isNull(passwordTokens.usedAt))
			);

			await db.insert(passwordTokens).values({ userId, tokenHash, purpose, expiresAt });

			return { token, expiresAt };
		},

		/** Looks up an unused, unexpired token. */
		async findValidPasswordToken(token: string) {
			const tokenHash = hashSessionToken(token, secret());
			const rows = await db
				.select()
				.from(passwordTokens)
				.where(
					and(
						eq(passwordTokens.tokenHash, tokenHash),
						isNull(passwordTokens.usedAt),
						gt(passwordTokens.expiresAt, new Date())
					)
				)
				.limit(1);
			return rows[0] ?? null;
		},

		/**
		 * Consumes a token and sets the password.
		 *
		 * Marks the token used and drops the account's existing sessions, so a
		 * reset also evicts whoever may have been holding one.
		 */
		async consumePasswordToken(token: string, passwordHash: string): Promise<PublicUserVm> {
			const tokenHash = hashSessionToken(token, secret());
			const now = new Date();

			const rows = await db
				.select()
				.from(passwordTokens)
				.where(
					and(
						eq(passwordTokens.tokenHash, tokenHash),
						isNull(passwordTokens.usedAt),
						gt(passwordTokens.expiresAt, now)
					)
				)
				.limit(1);

			const record = rows[0];
			if (!record) {
				throw new PolicyError('That link has expired or has already been used.');
			}

			const updated = await db
				.update(users)
				.set({ passwordHash })
				.where(eq(users.id, record.userId))
				.returning();

			await db
				.update(passwordTokens)
				.set({ usedAt: now })
				.where(eq(passwordTokens.id, record.id));

			await db.delete(sessions).where(eq(sessions.userId, record.userId));

			return toPublicUser(updated[0]);
		},

		/** Deletes tokens that are spent or past their expiry. */
		async deleteStalePasswordTokens(): Promise<void> {
			await db
				.delete(passwordTokens)
				.where(
					or(lt(passwordTokens.expiresAt, new Date()), isNotNull(passwordTokens.usedAt))
				);
		},

		async getAllUsersForAdmin(): Promise<PublicUserVm[]> {
			const rows = await db.select().from(users);
			return rows.map(toPublicUser);
		},

		async saveUser(input: {
			id?: number;
			fullName: string;
			email: string;
			role?: 'ADMIN' | 'SECRETARY' | 'LEADER' | 'MEMBER';
			avatarUrl?: string;
			passwordHash?: string;
		}) {
			// Demoting the only remaining administrator locks everyone out of the
			// staff portal, with no recovery path short of a database edit.
			if (input.id && input.role && input.role !== 'ADMIN') {
				if (await isLastAdmin(input.id)) {
					throw new PolicyError(
						'This is the only administrator account — promote another admin before changing this role.'
					);
				}
			}

			const values = {
				fullName: input.fullName,
				email: input.email,
				role: input.role || 'MEMBER',
				avatarUrl: input.avatarUrl || null,
				...(input.passwordHash ? { passwordHash: input.passwordHash } : {})
			};

			if (input.id) {
				const rows = await db.update(users).set(values).where(eq(users.id, input.id)).returning();
				return toPublicUser(rows[0]);
			}

			// A new account gets an unusable placeholder, never a fixed sentinel.
			// It cannot sign in until an invite link sets a real password.
			const rows = await db
				.insert(users)
				.values({
					...values,
					passwordHash: input.passwordHash || unusablePasswordHash()
				})
				.returning();

			return toPublicUser(rows[0]);
		},

		async deleteUser(id: number) {
			if (await isLastAdmin(id)) {
				throw new PolicyError(
					'This is the only administrator account and cannot be deleted.'
				);
			}
			await db.delete(users).where(eq(users.id, id));
		}
	};
}

