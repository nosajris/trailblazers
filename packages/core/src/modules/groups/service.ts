import { asc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { groups } from './schema.js';
import { toGroupCard } from './mappers.js';
import type { GroupCardVm } from './types.js';

export function createGroupService(db: Database) {
	return {
		async listPublished(): Promise<GroupCardVm[]> {
			const rows = await db
				.select()
				.from(groups)
				.where(eq(groups.status, 'PUBLISHED'))
				.orderBy(asc(groups.sortOrder), asc(groups.name));
			return rows.map(toGroupCard);
		}
	};
}
