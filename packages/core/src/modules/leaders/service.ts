import { asc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { leaders } from './schema.js';
import { toLeaderVm } from './mappers.js';
import type { LeaderVm } from './types.js';

export function createLeaderService(db: Database) {
	return {
		async listPublished(): Promise<LeaderVm[]> {
			const rows = await db
				.select()
				.from(leaders)
				.where(eq(leaders.status, 'PUBLISHED'))
				.orderBy(asc(leaders.order), asc(leaders.id));
			return rows.map(toLeaderVm);
		},

		async getAllForAdmin() {
			const rows = await db
				.select()
				.from(leaders)
				.orderBy(asc(leaders.order), asc(leaders.id));
			return rows.map((r) => ({
				id: r.id,
				name: r.name,
				role: r.role,
				imageUrl: r.imageUrl,
				order: r.order,
				status: r.status
			}));
		},

		async saveLeader(input: {
			id?: number;
			name: string;
			role: string;
			imageUrl?: string;
			order?: number;
			status?: string;
		}) {
			const values = {
				name: input.name,
				role: input.role,
				imageUrl: input.imageUrl || null,
				order: input.order ?? 0,
				status: input.status || 'PUBLISHED'
			};

			if (input.id) {
				const rows = await db.update(leaders).set(values).where(eq(leaders.id, input.id)).returning();
				return rows[0];
			} else {
				const rows = await db.insert(leaders).values(values).returning();
				return rows[0];
			}
		},

		async deleteLeader(id: number) {
			await db.delete(leaders).where(eq(leaders.id, id));
		}
	};
}

