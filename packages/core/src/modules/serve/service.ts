import { asc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { serveContent } from './schema.js';
import { toRichSectionVm } from './mappers.js';
import type { RichSectionVm } from './types.js';

export function createServeService(db: Database) {
	return {
		async getPrimaryPublished(): Promise<RichSectionVm | null> {
			const rows = await db
				.select()
				.from(serveContent)
				.where(eq(serveContent.status, 'PUBLISHED'))
				.orderBy(asc(serveContent.sortOrder), asc(serveContent.id))
				.limit(1);
			return rows[0] ? toRichSectionVm(rows[0]) : null;
		}
	};
}
