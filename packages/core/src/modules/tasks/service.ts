import type { Database } from '../../db/client.js';
import { createTasksRepository } from './repository.js';

export type FollowUpStep = { afterDays: number; title: string; description?: string };

/**
 * A newcomer who registers interest and then never hears from anyone is
 * worse than one who never registered at all — the dashboard's own "new
 * visitors this week" tile exists because of that. A single pre-visit
 * reminder already covered preparing for the visit itself; this is the
 * nurture sequence for after it: day 1 (a quick personal welcome), day 7
 * (check they found a group or service that fits), day 30 (see if they're
 * sticking). Three ordinary `tasks` rows, linked back to the same record a
 * single follow-up task already points at — no new table, no new concept.
 */
const NEWCOMER_FOLLOW_UP_SEQUENCE: FollowUpStep[] = [
	{ afterDays: 1, title: 'Day 1: Welcome', description: 'A quick personal message — glad they came, happy to answer anything.' },
	{ afterDays: 7, title: 'Day 7: Check in', description: 'See if they found a group, service, or team that fits.' },
	{ afterDays: 30, title: 'Day 30: Still connecting?', description: "Check they're sticking — and if not, what's missing." }
];

export function createTasksService(db: Database) {
	const repo = createTasksRepository(db);

	return {
		async getAllTasks() {
			return repo.findAll();
		},

		async createTask(
			title: string,
			description?: string,
			relatedEntityType?: string,
			relatedEntityId?: string,
			dueDate?: Date
		) {
			return repo.create({
				title,
				description: description || null,
				relatedEntityType: relatedEntityType || null,
				relatedEntityId: relatedEntityId || null,
				isCompleted: false,
				dueDate: dueDate ?? new Date(Date.now() + 86400000 * 2) // Default due in 2 days
			});
		},

		/**
		 * Creates the day-1/7/30 newcomer nurture sequence, each task due that
		 * many days from `anchorDate` (when the person registered interest —
		 * the only timestamp a visitor-type inquiry actually has). `contact`
		 * is folded into every task's title so each one is useful on its own
		 * in the staff task list, without an extra lookup back to the inquiry.
		 */
		async createFollowUpSequence(
			relatedEntityType: string,
			relatedEntityId: string,
			contact: string,
			anchorDate: Date = new Date()
		) {
			return Promise.all(
				NEWCOMER_FOLLOW_UP_SEQUENCE.map((step) =>
					repo.create({
						title: `${step.title} — ${contact}`,
						description: step.description ?? null,
						relatedEntityType,
						relatedEntityId,
						isCompleted: false,
						dueDate: new Date(anchorDate.getTime() + step.afterDays * 86400000)
					})
				)
			);
		},

		async toggleTaskCompleted(id: number, isCompleted: boolean) {
			return repo.updateStatus(id, isCompleted);
		},

		async deleteTask(id: number) {
			return repo.delete(id);
		}
	};
}

