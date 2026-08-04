import { asc, desc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { groups } from './schema.js';
import { toGroupCard } from './mappers.js';
import type { GroupCardVm, GroupAdminVm } from './types.js';

export function createGroupService(db: Database) {
	return {
		async listPublished(): Promise<GroupCardVm[]> {
			const rows = await db
				.select()
				.from(groups)
				.where(eq(groups.status, 'PUBLISHED'))
				.orderBy(asc(groups.sortOrder), asc(groups.name));
			return rows.map(toGroupCard);
		},

		async getAllForAdmin(): Promise<GroupAdminVm[]> {
			const rows = await db
				.select()
				.from(groups)
				.orderBy(asc(groups.sortOrder), asc(groups.name));
			return rows.map((r) => ({
				...toGroupCard(r),
				status: r.status,
				sortOrder: r.sortOrder
			}));
		},

		async saveGroup(input: {
			id?: number;
			name: string;
			leader: string;
			dayTime: string;
			type: 'CAMPUS' | 'PRO' | 'INTEREST' | 'ONLINE';
			imageUrl?: string;
			description?: string;
			status?: string;
			sortOrder?: number;
		}) {
			const values = {
				name: input.name,
				leader: input.leader,
				dayTime: input.dayTime,
				type: input.type,
				imageUrl: input.imageUrl || null,
				description: input.description || null,
				status: input.status || 'PUBLISHED',
				sortOrder: input.sortOrder ?? 0
			};

			if (input.id) {
				const rows = await db.update(groups).set(values).where(eq(groups.id, input.id)).returning();
				return rows[0];
			} else {
				const rows = await db.insert(groups).values(values).returning();
				return rows[0];
			}
		},

		async deleteGroup(id: number) {
			await db.delete(groups).where(eq(groups.id, id));
		}
	};
}

