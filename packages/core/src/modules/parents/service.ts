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
		},

		async getAllForAdmin() {
			const rows = await db
				.select()
				.from(parentContent)
				.orderBy(asc(parentContent.sortOrder), asc(parentContent.id));
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

		async saveParentContent(input: {
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
				const rows = await db.update(parentContent).set(values).where(eq(parentContent.id, input.id)).returning();
				return rows[0];
			} else {
				const rows = await db.insert(parentContent).values(values).returning();
				return rows[0];
			}
		},

		async deleteParentContent(id: number) {
			await db.delete(parentContent).where(eq(parentContent.id, id));
		}
	};
}

