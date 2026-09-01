import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { PolicyError, logger } from '@trailblazers/core';
import type { PageServerLoad, Actions } from './$types';
import { services } from '$lib/server/services.js';

/**
 * Sets a password from an invite or reset link.
 *
 * Deliberately unauthenticated: the single-use token is the credential. This is
 * what makes an admin-created account usable — accounts previously got the
 * literal hash `'pbkdf2:default'` and could never sign in, with no invite or
 * reset flow anywhere in the codebase.
 */

const MIN_PASSWORD_LENGTH = 12;

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');
	if (!token) return { valid: false as const };

	const record = await services.iam.findValidPasswordToken(token);
	if (!record) return { valid: false as const };

	return { valid: true as const, purpose: record.purpose };
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const form = await request.formData();
		const token = form.get('token')?.toString() || url.searchParams.get('token') || '';
		const password = form.get('password')?.toString() ?? '';
		const confirm = form.get('confirmPassword')?.toString() ?? '';

		if (!token) {
			return fail(400, { error: 'This link is missing its token. Use the link you were sent.' });
		}

		if (password.length < MIN_PASSWORD_LENGTH) {
			return fail(400, {
				error: `Choose a password of at least ${MIN_PASSWORD_LENGTH} characters.`
			});
		}

		if (password !== confirm) {
			return fail(400, { error: 'The two passwords do not match.' });
		}

		try {
			// Consuming the token also drops every session for that account, so a
			// reset evicts anyone who may already be signed in as them.
			const user = await services.iam.consumePasswordToken(token, await bcrypt.hash(password, 12));

			await services.auditLogs.logAction(
				'SET_PASSWORD',
				'USER',
				String(user.id),
				`Password set via emailed link for ${user.email}`,
				user.id,
				user.fullName
			);
		} catch (err) {
			if (err instanceof PolicyError) return fail(400, { error: err.message });
			logger.error('SetPassword', 'failed', {
				message: err instanceof Error ? err.message : String(err)
			});
			return fail(500, { error: 'Could not set that password. Please try again shortly.' });
		}

		throw redirect(303, '/login?passwordSet=1');
	}
};
