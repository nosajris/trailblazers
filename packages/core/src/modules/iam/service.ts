import { and, eq, gt } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { users, sessions } from './schema.js';
import { toPublicUser } from './mappers.js';
import type { PublicUserVm } from './types.js';

export function createIamService(db: Database) {
	return {
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

		async createSession(userId: number, sessionId: string, expiresAt: Date) {
			await db.insert(sessions).values({ id: sessionId, userId, expiresAt });
		},

		async deleteSession(sessionId: string) {
			await db.delete(sessions).where(eq(sessions.id, sessionId));
		},

		async validateSession(sessionId: string): Promise<PublicUserVm | null> {
			// Single join instead of two sequential round trips — this runs on every
			// authenticated request in both apps (see hooks.server.ts), so it's a hot path.
			const rows = await db
				.select({ user: users })
				.from(sessions)
				.innerJoin(users, eq(sessions.userId, users.id))
				.where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
				.limit(1);
			const row = rows[0];
			return row ? toPublicUser(row.user) : null;
		}
	};
}
