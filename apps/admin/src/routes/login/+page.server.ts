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

		try {
			const user = await services.iam.getUserByEmail(email);
			if (!user) {
				return fail(400, { error: 'Invalid credentials. Please ensure the database has been seeded.' });
			}

			const isValidPassword = user.passwordHash ? bcrypt.compareSync(password, user.passwordHash) : false;
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
		} catch (err: any) {
			if (err?.status === 303 || err?.location) {
				throw err; // Re-throw SvelteKit redirects
			}
			console.error('[AdminLoginError]', err);
			if (err?.code === 'ECONNREFUSED' || err?.cause?.code === 'ECONNREFUSED') {
				return fail(500, { error: 'Database connection failed (ECONNREFUSED). Please set DATABASE_URL in your Vercel project environment variables.' });
			}
			return fail(500, { error: err?.message || 'Database connection error during login.' });
		}

		throw redirect(303, '/');
	}
};
