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
			const session = await db.query.sessions.findFirst({
				where: and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date()))
			});
			if (!session) return null;
			const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
			return user ? toPublicUser(user) : null;
		}
	};
}
