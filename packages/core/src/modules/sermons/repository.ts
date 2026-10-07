import { count, desc, eq, sql } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { sermons, sermonSeries } from './schema.js';

export function createSermonRepository(db: Database) {
	return {
		async findAll() {
			return db.select().from(sermons).orderBy(desc(sermons.publishedAt));
		},

		async findFeatured() {
			return db.select().from(sermons).where(eq(sermons.isFeatured, true)).orderBy(desc(sermons.publishedAt)).limit(1);
		},

		async findBySlug(slug: string) {
			const rows = await db.select().from(sermons).where(eq(sermons.slug, slug)).limit(1);
			return rows[0] || null;
		},

		async findById(id: number) {
			const rows = await db.select().from(sermons).where(eq(sermons.id, id)).limit(1);
			return rows[0] || null;
		},

		async create(data: typeof sermons.$inferInsert) {
			const rows = await db.insert(sermons).values(data).returning();
			return rows[0];
		},

		async update(id: number, data: Partial<typeof sermons.$inferInsert>) {
			const rows = await db.update(sermons).set(data).where(eq(sermons.id, id)).returning();
			return rows[0];
		},

		async delete(id: number) {
			await db.delete(sermons).where(eq(sermons.id, id));
		},

		async findAllSeries() {
			return db.select().from(sermonSeries).orderBy(desc(sermonSeries.createdAt));
		},

		/**
		 * Series for the public Messages page, with how many messages each holds
		 * and when it was last added to. The count is a join rather than N
		 * follow-up queries, and a series with no messages is dropped — it would
		 * be an empty page.
		 */
		async findSeriesWithCounts() {
			const rows = await db
				.select({
					id: sermonSeries.id,
					title: sermonSeries.title,
					slug: sermonSeries.slug,
					description: sermonSeries.description,
					coverImageUrl: sermonSeries.coverImageUrl,
					messageCount: count(sermons.id),
					latestPublishedAt: sql<Date | null>`max(${sermons.publishedAt})`
				})
				.from(sermonSeries)
				.leftJoin(sermons, eq(sermons.seriesId, sermonSeries.id))
				.groupBy(
					sermonSeries.id,
					sermonSeries.title,
					sermonSeries.slug,
					sermonSeries.description,
					sermonSeries.coverImageUrl
				)
				.orderBy(desc(sql`max(${sermons.publishedAt})`));

			return rows.filter((row) => Number(row.messageCount) > 0);
		},

		async findSeriesBySlug(slug: string) {
			const rows = await db.select().from(sermonSeries).where(eq(sermonSeries.slug, slug)).limit(1);
			return rows[0] || null;
		},

		/** Messages in one series, newest first. */
		async findBySeriesId(seriesId: number) {
			return db
				.select()
				.from(sermons)
				.where(eq(sermons.seriesId, seriesId))
				.orderBy(desc(sermons.publishedAt));
		},

		/** One message plus the series it belongs to, for its own page. */
		async findBySlugWithSeries(slug: string) {
			const rows = await db
				.select({ sermon: sermons, series: sermonSeries })
				.from(sermons)
				.leftJoin(sermonSeries, eq(sermons.seriesId, sermonSeries.id))
				.where(eq(sermons.slug, slug))
				.limit(1);
			return rows[0] || null;
		},

		async createSeries(data: typeof sermonSeries.$inferInsert) {
			const rows = await db.insert(sermonSeries).values(data).returning();
			return rows[0];
		},

		async deleteSeries(id: number) {
			await db.delete(sermonSeries).where(eq(sermonSeries.id, id));
		}
	};
}

