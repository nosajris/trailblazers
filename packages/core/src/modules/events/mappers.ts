import { publicMediaUrl } from '../../util/public-media-url.js';
import type { events } from './schema.js';
import type { EventCardVm } from './types.js';

type EventRow = typeof events.$inferSelect;

export function toEventCard(row: EventRow): EventCardVm {
	return {
		id: row.id,
		title: row.title,
		description: row.description,
		date: row.date,
		location: row.location,
		imageUrl: publicMediaUrl(row.imageUrl),
		type: row.type,
		price: row.price ?? 0,
		isFeatured: row.isFeatured ?? false,
		capacity: row.capacity,
		registeredCount: row.registeredCount,
		earlyBirdDeadline: row.earlyBirdDeadline
	};
}
