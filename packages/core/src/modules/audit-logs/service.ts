import type { Database } from '../../db/client.js';
import { createAuditLogsRepository } from './repository.js';

export function createAuditLogsService(db: Database) {
	const repo = createAuditLogsRepository(db);

	return {
		async logAction(action: string, entityType: string, entityId?: string, details?: string, userId?: number, userName?: string) {
			return repo.create({
				action,
				entityType,
				entityId: entityId || null,
				details: details || null,
				userId: userId || null,
				userName: userName || 'Staff Admin'
			});
		},

		async getRecentLogs(limit = 50) {
			return repo.findAll(limit);
		}
	};
}
