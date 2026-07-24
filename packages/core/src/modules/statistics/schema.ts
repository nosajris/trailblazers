import { relations } from 'drizzle-orm';
import { date, integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { users } from '../iam/schema.js';

export const statistics = pgTable('statistics', {
	id: serial('id').primaryKey(),
	districtName: text('district_name').notNull(),
	date: date('date').notNull(),
	attendanceCount: integer('attendance_count').default(0),
	salvationsCount: integer('salvations_count').default(0),
	notes: text('notes'),
	submittedBy: integer('submitted_by').references(() => users.id)
});

export const statisticsRelations = relations(statistics, ({ one }) => ({
	submitter: one(users, { fields: [statistics.submittedBy], references: [users.id] })
}));
