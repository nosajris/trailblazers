import type { Database } from '../../db/client.js';
import { createTasksRepository } from './repository.js';

export function createTasksService(db: Database) {
	const repo = createTasksRepository(db);

	return {
		async getAllTasks() {
			return repo.findAll();
		},

		async createTask(title: string, description?: string, relatedEntityType?: string, relatedEntityId?: string) {
			return repo.create({
				title,
				description: description || null,
				relatedEntityType: relatedEntityType || null,
				relatedEntityId: relatedEntityId || null,
				isCompleted: false,
				dueDate: new Date(Date.now() + 86400000 * 2) // Default due in 2 days
			});
		},

		async toggleTaskCompleted(id: number, isCompleted: boolean) {
			return repo.updateStatus(id, isCompleted);
		}
	};
}
