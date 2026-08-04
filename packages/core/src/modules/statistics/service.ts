import { asc, desc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { statistics } from './schema.js';

export function createStatisticsService(db: Database) {
	return {
		async getAllForAdmin() {
			return db.select().from(statistics).orderBy(desc(statistics.date), asc(statistics.districtName));
		},

		async saveStatistic(input: {
			id?: number;
			districtName: string;
			date: string;
			attendanceCount?: number;
			salvationsCount?: number;
			notes?: string;
			submittedBy?: number;
		}) {
			const values = {
				districtName: input.districtName,
				date: input.date,
				attendanceCount: input.attendanceCount ?? 0,
				salvationsCount: input.salvationsCount ?? 0,
				notes: input.notes || null,
				submittedBy: input.submittedBy || null
			};

			if (input.id) {
				const rows = await db.update(statistics).set(values).where(eq(statistics.id, input.id)).returning();
				return rows[0];
			} else {
				const rows = await db.insert(statistics).values(values).returning();
				return rows[0];
			}
		},

		async deleteStatistic(id: number) {
			await db.delete(statistics).where(eq(statistics.id, id));
		}
	};
}
