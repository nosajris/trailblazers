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
		},

		async getAllForAdmin() {
			const rows = await db
				.select()
				.from(serveContent)
				.orderBy(asc(serveContent.sortOrder), asc(serveContent.id));
			return rows.map((r) => ({
				id: r.id,
				headline: r.headline,
				subheadline: r.subheadline,
				body: r.body,
				ctaLabel: r.ctaLabel,
				ctaHref: r.ctaHref,
				imageUrl: r.imageUrl,
				sortOrder: r.sortOrder,
				status: r.status
			}));
		},

		async saveServeContent(input: {
			id?: number;
			headline: string;
			subheadline?: string;
			body?: string;
			ctaLabel?: string;
			ctaHref?: string;
			imageUrl?: string;
			sortOrder?: number;
			status?: string;
		}) {
			const values = {
				headline: input.headline,
				subheadline: input.subheadline || null,
				body: input.body || null,
				ctaLabel: input.ctaLabel || null,
				ctaHref: input.ctaHref || null,
				imageUrl: input.imageUrl || null,
				sortOrder: input.sortOrder ?? 0,
				status: input.status || 'PUBLISHED',
				updatedAt: new Date()
			};

			if (input.id) {
				const rows = await db.update(serveContent).set(values).where(eq(serveContent.id, input.id)).returning();
				return rows[0];
			} else {
				const rows = await db.insert(serveContent).values(values).returning();
				return rows[0];
			}
		},

		async deleteServeContent(id: number) {
			await db.delete(serveContent).where(eq(serveContent.id, id));
		}
	};
}

