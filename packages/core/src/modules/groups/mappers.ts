import { publicMediaUrl } from '../../util/public-media-url.js';
import type { groups } from './schema.js';
import type { GroupCardVm } from './types.js';

type Row = typeof groups.$inferSelect;

export function toGroupCard(row: Row): GroupCardVm {
	return {
		id: row.id,
		name: row.name,
		leader: row.leader,
		dayTime: row.dayTime,
		type: row.type,
		imageUrl: publicMediaUrl(row.imageUrl),
		description: row.description
	};
}
