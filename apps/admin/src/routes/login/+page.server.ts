import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import type { Actions } from './$types';
import { services } from '$lib/server/services.js';
import { SESSION_COOKIE } from '$lib/server/auth-constants.js';
import { canAccessAdmin } from '$lib/server/auth.js';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const email = form.get('email')?.toString().trim();
		const password = form.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required' });
		}

		const user = await services.iam.getUserByEmail(email);
		if (!user) {
			return fail(400, { error: 'Invalid credentials' });
		}

		const isValidPassword = bcrypt.compareSync(password, user.passwordHash);
		if (!isValidPassword) {
			return fail(400, { error: 'Invalid credentials' });
		}

		if (!canAccessAdmin(user.role || undefined)) {
			return fail(403, { error: 'Access denied. Staff privileges required.' });
		}

		const sessionId = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 86400000 * 7);

		await services.iam.createSession(user.id, sessionId, expiresAt);
		await services.auditLogs.logAction('LOGIN', 'USER', String(user.id), `Staff logged in: ${user.email}`, user.id, user.fullName);

		cookies.set(SESSION_COOKIE, sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			expires: expiresAt
		});

		throw redirect(303, '/');
	}
};
