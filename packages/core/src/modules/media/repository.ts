import { desc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { mediaAssets } from './schema.js';

export function createMediaRepository(db: Database) {
	return {
		async insert(values: {
			url: string;
			width: number;
			height: number;
			variants: Record<string, string>;
			uploadedBy?: number;
		}) {
			const rows = await db
				.insert(mediaAssets)
				.values({
					url: values.url,
					width: values.width,
					height: values.height,
					variants: values.variants,
					uploadedBy: values.uploadedBy
				})
				.returning();
			return rows[0];
		},

		async delete(id: number) {
			await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
		},

		/** Most recently uploaded assets first, for the staff media picker. */
		async listRecent(limit: number) {
			return db
				.select()
				.from(mediaAssets)
				.orderBy(desc(mediaAssets.createdAt))
				.limit(limit);
		}
	};
}
