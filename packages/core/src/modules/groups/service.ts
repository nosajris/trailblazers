import { asc, desc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { groups, groupInterests } from './schema.js';
import { toGroupCard } from './mappers.js';
import { PolicyError } from '../iam/permissions.js';
import { Sanitizer } from '../../util/sanitizer.js';
import { logger } from '../../logger.js';
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

		/**
		 * Records someone asking to join a group.
		 *
		 * Groups were browse-only — a visitor could read about one and had no
		 * way to act on it. Asking twice updates the same row rather than
		 * queueing the leader twice.
		 */
		async expressInterest(input: {
			groupId: number;
			fullName: string;
			email: string;
			phone?: string;
			message?: string;
		}) {
			const group = await db.query.groups.findFirst({ where: eq(groups.id, input.groupId) });
			if (!group || group.status !== 'PUBLISHED') {
				throw new PolicyError('That group is not currently open to new members.');
			}

			const email = Sanitizer.email(input.email);

			await db
				.insert(groupInterests)
				.values({
					groupId: input.groupId,
					fullName: Sanitizer.text(input.fullName),
					email,
					phone: input.phone ? Sanitizer.phone(input.phone) : null,
					message: input.message ? Sanitizer.text(input.message) : null
				})
				.onConflictDoUpdate({
					target: [groupInterests.groupId, groupInterests.email],
					set: {
						fullName: Sanitizer.text(input.fullName),
						phone: input.phone ? Sanitizer.phone(input.phone) : null,
						message: input.message ? Sanitizer.text(input.message) : null,
						status: 'NEW'
					}
				});

			logger.info('GroupInterest', 'recorded', { groupId: input.groupId });

			return { groupName: group.name };
		},

		/** Interest requests for the staff portal, newest first. */
		async listInterests(status?: string) {
			const query = db
				.select()
				.from(groupInterests)
				.orderBy(desc(groupInterests.createdAt))
				.limit(200);

			return status ? query.where(eq(groupInterests.status, status)) : query;
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
			whatsappUrl?: string | null;
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
				whatsappUrl: input.whatsappUrl || null,
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

