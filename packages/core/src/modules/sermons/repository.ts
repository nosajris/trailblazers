import { eq, desc, and } from 'drizzle-orm';
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

		async createSeries(data: typeof sermonSeries.$inferInsert) {
			const rows = await db.insert(sermonSeries).values(data).returning();
			return rows[0];
		},

		async deleteSeries(id: number) {
			await db.delete(sermonSeries).where(eq(sermonSeries.id, id));
		}
	};
}

