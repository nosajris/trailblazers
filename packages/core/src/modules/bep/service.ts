import { and, asc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { bepProfiles } from './schema.js';
import { equipment } from '../equipment/schema.js';
import { toBepProfileVm, toEquipmentVm } from './mappers.js';
import type { BepProfileVm, EquipmentVm } from './types.js';

export function createBepService(db: Database) {
	return {
		async listVerifiedProfiles(): Promise<BepProfileVm[]> {
			const rows = await db
				.select()
				.from(bepProfiles)
				.where(and(eq(bepProfiles.isVerified, true), eq(bepProfiles.status, 'PUBLISHED')))
				.orderBy(asc(bepProfiles.sortOrder), asc(bepProfiles.id));
			return rows.map(toBepProfileVm);
		},

		async listAvailableEquipment(): Promise<EquipmentVm[]> {
			const rows = await db
				.select()
				.from(equipment)
				.where(eq(equipment.status, 'AVAILABLE'))
				.orderBy(asc(equipment.sortOrder), asc(equipment.id));
			return rows.map(toEquipmentVm);
		},

		async getAllForAdmin() {
			const rows = await db
				.select()
				.from(bepProfiles)
				.orderBy(asc(bepProfiles.sortOrder), asc(bepProfiles.id));
			return rows.map((r) => ({
				id: r.id,
				userId: r.userId,
				businessName: r.businessName,
				industry: r.industry,
				description: r.description,
				websiteUrl: r.websiteUrl,
				isVerified: r.isVerified ?? false,
				status: r.status,
				sortOrder: r.sortOrder
			}));
		},

		async saveBepProfile(input: {
			id?: number;
			userId?: number;
			businessName: string;
			industry: string;
			description: string;
			websiteUrl?: string;
			isVerified?: boolean;
			status?: string;
			sortOrder?: number;
		}) {
			const values = {
				userId: input.userId || 1,
				businessName: input.businessName,
				industry: input.industry,
				description: input.description,
				websiteUrl: input.websiteUrl || null,
				isVerified: input.isVerified ?? true,
				status: input.status || 'PUBLISHED',
				sortOrder: input.sortOrder ?? 0
			};

			if (input.id) {
				const rows = await db.update(bepProfiles).set(values).where(eq(bepProfiles.id, input.id)).returning();
				return rows[0];
			} else {
				const rows = await db.insert(bepProfiles).values(values).returning();
				return rows[0];
			}
		},

		async deleteBepProfile(id: number) {
			await db.delete(bepProfiles).where(eq(bepProfiles.id, id));
		}
	};
}

