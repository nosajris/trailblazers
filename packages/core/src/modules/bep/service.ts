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
		}
	};
}
