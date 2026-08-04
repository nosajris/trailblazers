import { desc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { tasks } from './schema.js';

export function createTasksRepository(db: Database) {
	return {
		async findAll() {
			return db.select().from(tasks).orderBy(desc(tasks.createdAt));
		},

		async create(data: typeof tasks.$inferInsert) {
			const rows = await db.insert(tasks).values(data).returning();
			return rows[0];
		},

		async updateStatus(id: number, isCompleted: boolean) {
			const rows = await db.update(tasks).set({ isCompleted }).where(eq(tasks.id, id)).returning();
			return rows[0];
		},

		async delete(id: number) {
			await db.delete(tasks).where(eq(tasks.id, id));
		}
	};
}

