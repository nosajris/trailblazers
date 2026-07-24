import { relations } from 'drizzle-orm';
import { bepProfiles } from '../modules/bep/schema.js';
import { blogs } from '../modules/blog/schema.js';
import { users, sessions } from '../modules/iam/schema.js';

/** Relational API for users — defined here to avoid circular imports between iam/blog/bep. */
export const usersRelations = relations(users, ({ one, many }) => ({
	sessions: many(sessions),
	blogs: many(blogs),
	bepProfile: one(bepProfiles, {
		fields: [users.id],
		references: [bepProfiles.userId]
	})
}));
