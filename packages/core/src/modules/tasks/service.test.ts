/**
 * Service-layer tests with a fake database — see
 * `modules/inquiries/service.test.ts` for the pattern this copies.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { createTasksService } from './service.ts';

type Row = Record<string, unknown>;

function fakeDb() {
	const inserted: Row[] = [];
	let nextId = 1;

	const builder: any = {
		insert() {
			return builder;
		},
		values(v: Row) {
			const row = { id: nextId++, isCompleted: false, ...v };
			inserted.push(row);
			builder._last = row;
			return builder;
		},
		returning() {
			return Promise.resolve([builder._last]);
		},
		select() {
			return builder;
		},
		from() {
			return Promise.resolve(inserted);
		},
		orderBy() {
			return Promise.resolve(inserted);
		}
	};

	return { db: builder, inserted };
}

test('createTask defaults to a two-day due date when none is given', async () => {
	const { db } = fakeDb();
	const service = createTasksService(db);
	const before = Date.now();

	const task = await service.createTask('Call back', 'details', 'INQUIRY', '5');

	assert.equal(task.relatedEntityType, 'INQUIRY');
	assert.equal(task.relatedEntityId, '5');
	const dueInMs = task.dueDate.getTime() - before;
	assert.ok(dueInMs > 86400000 * 1.9 && dueInMs < 86400000 * 2.1, `expected ~2 days, got ${dueInMs}ms`);
});

test('createTask honors an explicit due date when given', async () => {
	const { db } = fakeDb();
	const service = createTasksService(db);
	const due = new Date('2030-01-01T00:00:00Z');

	const task = await service.createTask('Something', undefined, undefined, undefined, due);

	assert.equal(task.dueDate.toISOString(), due.toISOString());
});

test('createFollowUpSequence creates three tasks at day 1, 7 and 30 from the anchor', async () => {
	const { db, inserted } = fakeDb();
	const service = createTasksService(db);
	const anchor = new Date('2026-01-01T00:00:00Z');

	const tasks = await service.createFollowUpSequence('INQUIRY', '42', 'Jane Doe', anchor);

	assert.equal(tasks.length, 3);
	assert.equal(inserted.length, 3);
	assert.ok(inserted.every((t) => t.relatedEntityType === 'INQUIRY' && t.relatedEntityId === '42'));
	assert.ok(inserted.every((t) => (t.title as string).includes('Jane Doe')));

	const days = inserted
		.map((t) => Math.round(((t.dueDate as Date).getTime() - anchor.getTime()) / 86400000))
		.sort((a, b) => a - b);
	assert.deepEqual(days, [1, 7, 30]);
});

test('createFollowUpSequence anchors to now when no anchor date is given', async () => {
	const { db, inserted } = fakeDb();
	const service = createTasksService(db);
	const before = Date.now();

	await service.createFollowUpSequence('INQUIRY', '1', 'Someone');

	const firstDueMs = (inserted[0].dueDate as Date).getTime() - before;
	// The day-1 step, so roughly one day out from "now".
	assert.ok(firstDueMs > 86400000 * 0.9 && firstDueMs < 86400000 * 1.1);
});
