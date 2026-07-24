import { publicMediaUrl } from '../../util/public-media-url.js';
import type { bepProfiles } from './schema.js';
import type { equipment } from '../equipment/schema.js';
import type { BepProfileVm, EquipmentVm } from './types.js';

type BepRow = typeof bepProfiles.$inferSelect;
type EqRow = typeof equipment.$inferSelect;

export function toBepProfileVm(row: BepRow): BepProfileVm {
	return {
		id: row.id,
		businessName: row.businessName,
		industry: row.industry,
		description: row.description,
		websiteUrl: row.websiteUrl,
		isVerified: row.isVerified ?? false
	};
}

export function toEquipmentVm(row: EqRow): EquipmentVm {
	return {
		id: row.id,
		name: row.name,
		description: row.description,
		dailyRate: row.dailyRate,
		imageUrl: publicMediaUrl(row.imageUrl),
		status: String(row.status)
	};
}
