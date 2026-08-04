import { relations } from 'drizzle-orm';
import { pgTable, serial, text, integer, boolean, index } from 'drizzle-orm/pg-core';
import { users } from '../iam/schema.js';

export const bepProfiles = pgTable(
	'bep_profiles',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.references(() => users.id)
			.notNull(),
		businessName: text('business_name').notNull(),
		industry: text('industry').notNull(),
		description: text('description').notNull(),
		websiteUrl: text('website_url'),
		isVerified: boolean('is_verified').default(false),
		status: text('status').notNull().default('PUBLISHED'),
		sortOrder: integer('sort_order').default(0)
	},
	(table) => [
		index('bep_profiles_user_id_idx').on(table.userId),
		// Covers `WHERE is_verified = true AND status = 'PUBLISHED'` (listVerifiedProfiles)
		index('bep_profiles_verified_status_idx').on(table.isVerified, table.status)
	]
);

export const bepProfilesRelations = relations(bepProfiles, ({ one }) => ({
	user: one(users, { fields: [bepProfiles.userId], references: [users.id] })
}));
