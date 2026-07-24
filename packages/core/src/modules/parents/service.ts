import { asc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { publicMediaUrl } from '../../util/public-media-url.js';
import { parentContent } from './schema.js';
import type { RichSectionVm } from '../serve/types.js';

export function createParentService(db: Database) {
	return {
		async getPrimaryPublished(): Promise<RichSectionVm | null> {
			const rows = await db
				.select()
				.from(parentContent)
				.where(eq(parentContent.status, 'PUBLISHED'))
				.orderBy(asc(parentContent.sortOrder), asc(parentContent.id))
				.limit(1);
			const row = rows[0];
			if (!row) return null;
			return {
				id: row.id,
				headline: row.headline,
				subheadline: row.subheadline,
				body: row.body,
				ctaLabel: row.ctaLabel,
				ctaHref: row.ctaHref,
				imageUrl: publicMediaUrl(row.imageUrl)
			};
		}
	};
}
