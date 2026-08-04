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
		},

		async getAllForAdmin() {
			const rows = await db
				.select()
				.from(newcomerContent)
				.orderBy(asc(newcomerContent.sortOrder), asc(newcomerContent.id));
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

		async saveNewcomerContent(input: {
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
				const rows = await db.update(newcomerContent).set(values).where(eq(newcomerContent.id, input.id)).returning();
				return rows[0];
			} else {
				const rows = await db.insert(newcomerContent).values(values).returning();
				return rows[0];
			}
		},

		async deleteNewcomerContent(id: number) {
			await db.delete(newcomerContent).where(eq(newcomerContent.id, id));
		}
	};
}

