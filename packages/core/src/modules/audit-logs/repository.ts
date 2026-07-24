import { desc, eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { auditLogs } from './schema.js';

export function createAuditLogsRepository(db: Database) {
	return {
		async findAll(limit = 100) {
			return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
		},

		async create(data: typeof auditLogs.$inferInsert) {
			const rows = await db.insert(auditLogs).values(data).returning();
			return rows[0];
		}
	};
}
