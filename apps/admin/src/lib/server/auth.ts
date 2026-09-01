import { error, redirect } from '@sveltejs/kit';
import {
	canAccessAdmin,
	canAccessPath,
	canAccessSection,
	canManageUsers,
	checkUserMutation,
	sectionForPath,
	type AdminSection,
	type PublicUserVm,
	type UserMutation
} from '@trailblazers/core';

export {
	canAccessAdmin,
	canAccessPath,
	canAccessSection,
	canManageUsers,
	checkUserMutation,
	sectionForPath
};

/**
 * Guard for form actions.
 *
 * SvelteKit runs a form action *before* it re-runs layout loads, so the guard
 * in `+layout.server.ts` does not protect POSTs — a signed-in secretary could
 * post straight to `/users?/saveUser` and have it execute. Every action in an
 * admin-only section must call this itself.
 */
export function requireSection(
	user: PublicUserVm | null | undefined,
	section: AdminSection
): PublicUserVm {
	if (!user) throw redirect(303, '/login');
	if (!canAccessSection(user.role, section)) {
		throw error(403, 'You do not have permission to perform this action.');
	}
	return user;
}

/** Applies the staff-account rules, converting a denial into a 403. */
export function requireUserMutation(
	user: PublicUserVm | null | undefined,
	mutation: UserMutation
): PublicUserVm {
	const actor = requireSection(user, 'users');
	const decision = checkUserMutation({ id: actor.id, role: actor.role }, mutation);

	if (!decision.allowed) throw error(403, decision.reason);
	return actor;
}
