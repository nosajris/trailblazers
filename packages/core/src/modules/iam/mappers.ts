import type { users } from './schema.js';
import type { PublicUserVm, UserRole } from './types.js';

type Row = typeof users.$inferSelect;

export function toPublicUser(row: Row): PublicUserVm {
	return {
		id: row.id,
		email: row.email,
		fullName: row.fullName,
		role: row.role as UserRole
	};
}
