import { asc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { publicMediaUrl } from '../../util/public-media-url.js';
import { newcomerContent } from './schema.js';
import { toRichSectionVm } from '../serve/mappers.js';
import type { RichSectionVm } from '../serve/types.js';

export function createNewcomerService(db: Database) {
	return {
		async getPrimaryPublished(): Promise<RichSectionVm | null> {
			const rows = await db
				.select()
				.from(newcomerContent)
				.where(eq(newcomerContent.status, 'PUBLISHED'))
				.orderBy(asc(newcomerContent.sortOrder), asc(newcomerContent.id))
				.limit(1);
			return rows[0]
				? {
						id: rows[0].id,
						headline: rows[0].headline,
						subheadline: rows[0].subheadline,
						body: rows[0].body,
						ctaLabel: rows[0].ctaLabel,
						ctaHref: rows[0].ctaHref,
						imageUrl: publicMediaUrl(rows[0].imageUrl)
					}
				: null;
		}
	};
}
