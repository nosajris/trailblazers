// Defined in permissions.ts, which is kept import-free so the policy stays
// directly testable. Re-exported here so `types.ts` remains the canonical
// import site for the rest of the codebase.
export type { UserRole } from './permissions.js';

import type { UserRole } from './permissions.js';

export type PublicUserVm = {
	id: number;
	email: string;
	fullName: string;
	role: UserRole;
	avatarUrl: string | null;
};

