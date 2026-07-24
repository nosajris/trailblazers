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
		}
	};
}
