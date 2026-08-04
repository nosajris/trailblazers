import { relations } from 'drizzle-orm';
import { date, index, integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { users } from '../iam/schema.js';

export const statistics = pgTable(
	'statistics',
	{
		id: serial('id').primaryKey(),
		districtName: text('district_name').notNull(),
		date: date('date').notNull(),
		attendanceCount: integer('attendance_count').default(0),
		salvationsCount: integer('salvations_count').default(0),
		notes: text('notes'),
		submittedBy: integer('submitted_by').references(() => users.id)
	},
	(table) => [
		index('statistics_district_date_idx').on(table.districtName, table.date),
		index('statistics_submitted_by_idx').on(table.submittedBy)
	]
);

export const statisticsRelations = relations(statistics, ({ one }) => ({
	submitter: one(users, { fields: [statistics.submittedBy], references: [users.id] })
}));
