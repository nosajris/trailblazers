/**
 * Authorization policy for the staff portal.
 *
 * Kept free of imports so it stays pure and directly testable: every function
 * here is a total function of its arguments, with no database or request state.
 *
 * Background: the portal used to be guarded by a single `canAccessAdmin` check
 * in `+layout.server.ts`, which admitted ADMIN and SECRETARY alike. That made
 * `/users` reachable by a secretary, who could then grant themselves ADMIN.
 * Access is now decided per section, and user mutations have their own rules.
 */

export type UserRole = 'ADMIN' | 'SECRETARY' | 'LEADER' | 'MEMBER';

/** Coarse grouping of admin routes that share an access rule. */
export type AdminSection = 'content' | 'submissions' | 'users' | 'settings' | 'audit';

/** Roles allowed to reach the staff portal at all. */
export const ADMIN_PORTAL_ROLES: readonly UserRole[] = ['ADMIN', 'SECRETARY'];

/**
 * Which roles may enter each section. Sections absent from a role's list are
 * denied — this is an allow-list, so a new section defaults to closed only if
 * it is added here; unmapped *paths* fall back to `content` (see below).
 */
const SECTION_ROLES: Readonly<Record<AdminSection, readonly UserRole[]>> = {
	content: ['ADMIN', 'SECRETARY'],
	submissions: ['ADMIN', 'SECRETARY'],
	users: ['ADMIN'],
	settings: ['ADMIN'],
	audit: ['ADMIN']
};

/**
 * Route prefixes that map to a non-default section. Anything unlisted is
 * `content`, which both portal roles can reach — content management is the
 * bulk of the portal and the safe default.
 */
const SECTION_BY_PREFIX: readonly (readonly [string, AdminSection])[] = [
	['/users', 'users'],
	['/settings', 'settings'],
	['/audit-logs', 'audit'],
	['/submissions', 'submissions']
];

/** True when `pathname` is `prefix` itself or a descendant of it. */
function matchesPrefix(pathname: string, prefix: string): boolean {
	if (pathname === prefix) return true;
	return pathname.startsWith(prefix + '/');
}

/** Strips a trailing slash so `/users/` and `/users` behave identically. */
function normalizePath(pathname: string): string {
	if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
	return pathname;
}

/** May this role open the staff portal at all? */
export function canAccessAdmin(role: UserRole | null | undefined): boolean {
	if (!role) return false;
	return ADMIN_PORTAL_ROLES.includes(role);
}

/** Which section does an admin-app pathname belong to? */
export function sectionForPath(pathname: string): AdminSection {
	const path = normalizePath(pathname);
	for (const [prefix, section] of SECTION_BY_PREFIX) {
		if (matchesPrefix(path, prefix)) return section;
	}
	return 'content';
}

/** May this role enter this section? */
export function canAccessSection(role: UserRole | null | undefined, section: AdminSection): boolean {
	if (!role) return false;
	return SECTION_ROLES[section].includes(role);
}

/** May this role open this admin-app pathname? */
export function canAccessPath(role: UserRole | null | undefined, pathname: string): boolean {
	return canAccessSection(role, sectionForPath(pathname));
}

/** May this role create, edit, or delete staff accounts? */
export function canManageUsers(role: UserRole | null | undefined): boolean {
	return canAccessSection(role, 'users');
}

/** Who is asking. */
export type Actor = { id: number; role: UserRole };

/**
 * What they want to do to a staff account.
 *
 * Kept separate from the actor so callers can build it from form data without
 * an `Omit` over a discriminated union, which would quietly collapse to the
 * union's common keys and drop `targetId` / `nextRole`.
 */
export type UserMutation =
	| { kind: 'create'; nextRole: UserRole }
	| { kind: 'update'; targetId: number; targetRole: UserRole; nextRole: UserRole }
	| { kind: 'delete'; targetId: number };

export type PolicyDecision = { allowed: true } | { allowed: false; reason: string };

/**
 * A rule the caller broke, with a message that is safe to show them.
 *
 * Everything else thrown out of a service is treated as internal and must be
 * logged rather than rendered — see the login and health handlers.
 */
export class PolicyError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'PolicyError';
	}
}

const ALLOWED: PolicyDecision = { allowed: true };

function denied(reason: string): PolicyDecision {
	return { allowed: false, reason };
}

/**
 * Rules for mutating staff accounts, beyond "is the actor an admin".
 *
 * An admin may not change their own role or delete their own account: both are
 * self-inflicted lockouts, and the first is the escalation path we are closing.
 * Protecting the *last* remaining admin needs a row count, so it lives in the
 * service layer rather than here.
 */
export function checkUserMutation(actor: Actor, mutation: UserMutation): PolicyDecision {
	if (!canManageUsers(actor.role)) {
		return denied('Only an administrator can manage staff accounts.');
	}

	if (mutation.kind === 'update') {
		if (actor.id === mutation.targetId && mutation.nextRole !== mutation.targetRole) {
			return denied('You cannot change your own role.');
		}
		return ALLOWED;
	}

	if (mutation.kind === 'delete') {
		if (actor.id === mutation.targetId) {
			return denied('You cannot delete your own account.');
		}
		return ALLOWED;
	}

	return ALLOWED;
}
