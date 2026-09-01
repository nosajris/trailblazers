import { fail } from '@sveltejs/kit';
import { PolicyError, logger, type UserRole } from '@trailblazers/core';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';
import { requireSection, requireUserMutation } from '$lib/server/auth.js';

const ROLES: readonly UserRole[] = ['ADMIN', 'SECRETARY', 'LEADER', 'MEMBER'];

function parseRole(raw: string | undefined): UserRole {
	return ROLES.includes(raw as UserRole) ? (raw as UserRole) : 'MEMBER';
}

export const load: PageServerLoad = async ({ locals }) => {
	// The layout guard covers loads too, but this route hands out account data,
	// so it states its own requirement rather than inheriting one.
	requireSection(locals.user, 'users');
	const users = await services.iam.getAllUsersForAdmin();
	return { users };
};

export const actions: Actions = {
	saveUser: async ({ request, locals, url }) => {
		// Refuse before touching the database: otherwise a non-admin could tell a
		// real account from a missing one by the 403-vs-404 they get back.
		requireSection(locals.user, 'users');

		const form = await request.formData();
		const id = form.get('id') ? Number(form.get('id')) : undefined;
		const fullName = form.get('fullName')?.toString().trim();
		const email = form.get('email')?.toString().trim();
		const role = parseRole(form.get('role')?.toString());
		const avatarUrl = form.get('avatarUrl')?.toString().trim();

		if (id !== undefined && !Number.isInteger(id)) {
			return fail(400, { error: 'Invalid user reference' });
		}

		if (id) {
			const target = await services.iam.getUserById(id);
			if (!target) return fail(404, { error: 'That account no longer exists' });

			// Throws 403 for a non-admin actor, or an admin editing their own role.
			requireUserMutation(locals.user, {
				kind: 'update',
				targetId: id,
				targetRole: (target.role ?? 'MEMBER') as UserRole,
				nextRole: role
			});
		} else {
			requireUserMutation(locals.user, { kind: 'create', nextRole: role });
		}

		if (!fullName || !email) {
			return fail(400, { error: 'Full name and email are required' });
		}

		try {
			const saved = await services.iam.saveUser({ id, fullName, email, role, avatarUrl });

			await services.auditLogs.logAction(
				id ? 'UPDATE_USER' : 'CREATE_USER',
				'USER',
				String(saved.id),
				`Saved staff user account: ${saved.fullName} (${saved.email})`,
				locals.user?.id,
				locals.user?.fullName
			);

			// A new account has no usable password. Mint the invite link now and
			// hand it back, since the email service is still a stub that only
			// logs — the admin passes it on themselves.
			if (!id) {
				const invite = await services.iam.issuePasswordToken(saved.id, 'INVITE');
				return {
					success: true,
					inviteLink: `${url.origin}/set-password?token=${invite.token}`,
					inviteFor: saved.email,
					inviteExpiresAt: invite.expiresAt.toISOString()
				};
			}

			return { success: true };
		} catch (err) {
			// A PolicyError carries a message written for the operator. Anything
			// else is internal and must not reach the browser.
			if (err instanceof PolicyError) return fail(409, { error: err.message });
			logger.error('AdminUsers', 'saveUser failed', { userId: locals.user?.id, targetId: id });
			return fail(500, { error: 'Could not save that account. Please try again.' });
		}
	},

	/**
	 * Issues a fresh password link for an existing account.
	 *
	 * Surfaces the link rather than emailing it, because the email service is
	 * still a stub. Issuing one retires any outstanding link for that account.
	 */
	resetPassword: async ({ request, locals, url }) => {
		requireSection(locals.user, 'users');

		const form = await request.formData();
		const id = Number(form.get('id'));

		if (!Number.isInteger(id) || id <= 0) {
			return fail(400, { error: 'Invalid user reference' });
		}

		const target = await services.iam.getUserById(id);
		if (!target) return fail(404, { error: 'That account no longer exists' });

		try {
			const reset = await services.iam.issuePasswordToken(id, 'RESET');

			await services.auditLogs.logAction(
				'ISSUE_PASSWORD_RESET',
				'USER',
				String(id),
				`Issued a password reset link for ${target.email}`,
				locals.user?.id,
				locals.user?.fullName
			);

			return {
				success: true,
				inviteLink: `${url.origin}/set-password?token=${reset.token}`,
				inviteFor: target.email,
				inviteExpiresAt: reset.expiresAt.toISOString()
			};
		} catch (err) {
			if (err instanceof PolicyError) return fail(409, { error: err.message });
			logger.error('AdminUsers', 'resetPassword failed', {
				userId: locals.user?.id,
				targetId: id
			});
			return fail(500, { error: 'Could not create a reset link. Please try again.' });
		}
	},

	deleteUser: async ({ request, locals }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));

		if (!Number.isInteger(id) || id <= 0) {
			return fail(400, { error: 'Invalid user reference' });
		}

		requireUserMutation(locals.user, { kind: 'delete', targetId: id });

		try {
			await services.iam.deleteUser(id);

			await services.auditLogs.logAction(
				'DELETE_USER',
				'USER',
				String(id),
				`Deleted user account ID: ${id}`,
				locals.user?.id,
				locals.user?.fullName
			);

			return { success: true };
		} catch (err) {
			if (err instanceof PolicyError) return fail(409, { error: err.message });
			logger.error('AdminUsers', 'deleteUser failed', { userId: locals.user?.id, targetId: id });
			return fail(500, { error: 'Could not delete that account. Please try again.' });
		}
	}
};
