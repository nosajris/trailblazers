import { asc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { equipment } from './schema.js';

export function createEquipmentService(db: Database) {
	return {
		async getAllForAdmin() {
			return db.select().from(equipment).orderBy(asc(equipment.sortOrder), asc(equipment.name));
		},

		async saveEquipment(input: {
			id?: number;
			name: string;
			description?: string;
			status?: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
			dailyRate: number;
			imageUrl?: string;
			sortOrder?: number;
		}) {
			const values = {
				name: input.name,
				description: input.description || null,
				status: input.status || 'AVAILABLE',
				dailyRate: input.dailyRate ?? 0,
				imageUrl: input.imageUrl || null,
				sortOrder: input.sortOrder ?? 0
			};

			if (input.id) {
				const rows = await db.update(equipment).set(values).where(eq(equipment.id, input.id)).returning();
				return rows[0];
			} else {
				const rows = await db.insert(equipment).values(values).returning();
				return rows[0];
			}
		},

		async deleteEquipment(id: number) {
			await db.delete(equipment).where(eq(equipment.id, id));
		}
	};
}
