import { publicMediaUrl } from '../../util/public-media-url.js';
import type { leaders } from './schema.js';
import type { LeaderVm } from './types.js';

type Row = typeof leaders.$inferSelect;

export function toLeaderVm(row: Row): LeaderVm {
	return {
		id: row.id,
		name: row.name,
		role: row.role,
		imageUrl: publicMediaUrl(row.imageUrl),
		order: row.order ?? 0
	};
}
