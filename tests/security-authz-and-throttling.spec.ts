import { test, expect, request as playwrightRequest, type Page } from '@playwright/test';

/**
 * Security regressions for the staff portal and the public write endpoints.
 *
 * Requires BOTH apps running and a seeded database:
 *   npm run seed
 *   npm run dev:web     (5173 — started by playwright.config.ts)
 *   npm run dev:admin   (5174 — start this yourself)
 *
 * Seeded accounts used here: admin@paoz.test / password123 (ADMIN) and
 * secretary@paoz.org / secret (SECRETARY).
 */

const ADMIN_ORIGIN = 'http://localhost:5174';

const ADMIN = { email: 'admin@paoz.test', password: 'password123' };
const SECRETARY = { email: 'secretary@paoz.org', password: 'secret' };

const ADMIN_ONLY_PATHS = ['/users', '/settings', '/audit-logs'];

async function login(page: Page, who: { email: string; password: string }) {
	await page.goto(`${ADMIN_ORIGIN}/login`);
	await page.locator('#admin-email-input').fill(who.email);
	await page.locator('#admin-password-input').fill(who.password);
	await page.locator('button[type="submit"]').click();
	await page.waitForURL((url: URL) => !url.pathname.startsWith('/login'));
}

test.describe('Staff portal authorization', () => {
	test('a secretary is bounced off every admin-only page', async ({ page }) => {
		await login(page, SECRETARY);

		for (const path of ADMIN_ONLY_PATHS) {
			await page.goto(`${ADMIN_ORIGIN}${path}`);
			await expect(page, `secretary should not rest on ${path}`).not.toHaveURL(
				new RegExp(`${path}$`)
			);
		}
	});

	test('a secretary sees no admin-only navigation', async ({ page }) => {
		await login(page, SECRETARY);
		await expect(page.locator('a[href="/users"]')).toHaveCount(0);
		await expect(page.locator('a[href="/settings"]')).toHaveCount(0);
		await expect(page.locator('a[href="/audit-logs"]')).toHaveCount(0);
	});

	test('an admin still reaches every admin-only page', async ({ page }) => {
		await login(page, ADMIN);

		for (const path of ADMIN_ONLY_PATHS) {
			await page.goto(`${ADMIN_ORIGIN}${path}`);
			await expect(page, `admin should reach ${path}`).toHaveURL(new RegExp(`${path}$`));
		}
	});

	test('a secretary keeps content management', async ({ page }) => {
		await login(page, SECRETARY);

		for (const path of ['/events', '/sermons', '/submissions']) {
			await page.goto(`${ADMIN_ORIGIN}${path}`);
			await expect(page, `secretary should reach ${path}`).toHaveURL(new RegExp(`${path}$`));
		}
	});

	test('the escalation path is closed: a secretary POSTing to saveUser is refused', async ({
		page
	}) => {
		// The heart of the fix. SvelteKit runs form actions before layout loads,
		// so a page guard alone would not stop this — the action must refuse.
		await login(page, SECRETARY);

		const response = await page.request.post(`${ADMIN_ORIGIN}/users?/saveUser`, {
			form: {
				id: '2',
				fullName: 'Rutendo Chikafu',
				email: SECRETARY.email,
				role: 'ADMIN'
			}
		});

		expect(response.status(), 'a secretary must not be able to grant themselves ADMIN').toBe(403);
	});

	test('a secretary POSTing to deleteUser is refused', async ({ page }) => {
		await login(page, SECRETARY);

		const response = await page.request.post(`${ADMIN_ORIGIN}/users?/deleteUser`, {
			form: { id: '1' }
		});

		expect(response.status()).toBe(403);
	});

	test('a secretary POSTing to saveSettings is refused', async ({ page }) => {
		await login(page, SECRETARY);

		const response = await page.request.post(`${ADMIN_ORIGIN}/settings?/saveSettings`, {
			form: { seoTitle: 'Owned', seoDescription: 'Owned' }
		});

		expect(response.status()).toBe(403);
	});

	test('signed-out visitors are sent to the login page', async ({ page }) => {
		for (const path of [...ADMIN_ONLY_PATHS, '/events']) {
			await page.goto(`${ADMIN_ORIGIN}${path}`);
			await expect(page).toHaveURL(/\/login$/);
		}
	});
});

test.describe('Login hardening', () => {
	test('unknown and wrong-password attempts return the same message', async ({ page }) => {
		await page.goto(`${ADMIN_ORIGIN}/login`);
		await page.locator('#admin-email-input').fill('definitely-not-a-user@example.com');
		await page.locator('#admin-password-input').fill('whatever');
		await page.locator('button[type="submit"]').click();
		await expect(page.getByText('Invalid email or password')).toBeVisible();

		await page.goto(`${ADMIN_ORIGIN}/login`);
		await page.locator('#admin-email-input').fill(ADMIN.email);
		await page.locator('#admin-password-input').fill('definitely-the-wrong-password');
		await page.locator('button[type="submit"]').click();
		await expect(page.getByText('Invalid email or password')).toBeVisible();

		// The old copy named the seeding state only for unknown accounts, which
		// told an attacker which addresses exist.
		await expect(page.getByText(/database has been seeded/i)).toHaveCount(0);
	});

	test('repeated failures are throttled', async ({ browser }) => {
		// A fresh context so this test's attempts are the only ones on the window.
		const context = await browser.newContext();
		const page = await context.newPage();

		let throttled = false;

		for (let attempt = 0; attempt < 8; attempt++) {
			await page.goto(`${ADMIN_ORIGIN}/login`);
			await page.locator('#admin-email-input').fill('throttle-probe@example.com');
			await page.locator('#admin-password-input').fill(`wrong-${attempt}`);
			await page.locator('button[type="submit"]').click();

			const body = await page.textContent('body');
			if (body?.includes('Too many sign-in attempts')) {
				throttled = true;
				break;
			}
		}

		expect(throttled, 'login should throttle after repeated failures').toBe(true);
		await context.close();
	});

	test('an internal failure never echoes driver detail', async ({ page }) => {
		await page.goto(`${ADMIN_ORIGIN}/login`);
		await page.locator('#admin-email-input').fill('leak-probe@example.com');
		await page.locator('#admin-password-input').fill('whatever');
		await page.locator('button[type="submit"]').click();

		const body = (await page.textContent('body')) ?? '';
		for (const leak of ['ECONNREFUSED', 'postgres', 'postgresql://', 'password_hash']) {
			expect(body.toLowerCase()).not.toContain(leak.toLowerCase());
		}
	});
});

test.describe('Session and response hardening', () => {
	test('the session cookie is not the value stored in the database', async ({ page }) => {
		await login(page, ADMIN);

		const cookies = await page.context().cookies();
		const session = cookies.find((c) => c.name === 'trailblazers_admin_session');

		expect(session, 'a session cookie should be set').toBeTruthy();
		expect(session!.httpOnly, 'must not be readable from JavaScript').toBe(true);
		// The stored form is a 64-character sha256 hex digest; the cookie is a
		// base64url token, so seeing hex here would mean the hash leaked.
		expect(session!.value).not.toMatch(/^[0-9a-f]{64}$/);
	});

	test('security headers are present on both apps', async ({ request }) => {
		for (const origin of ['http://localhost:5173', ADMIN_ORIGIN]) {
			const response = await request.get(`${origin}/api/health`);
			const headers = response.headers();

			expect(headers['x-frame-options'], origin).toBe('DENY');
			expect(headers['x-content-type-options'], origin).toBe('nosniff');
			expect(headers['referrer-policy'], origin).toBe('strict-origin-when-cross-origin');
			expect(headers['permissions-policy'], origin).toContain('camera=()');
		}
	});

	test('a page response carries a content security policy', async ({ page }) => {
		const response = await page.goto('http://localhost:5173/');
		const csp = response?.headers()['content-security-policy'];

		expect(csp, 'SvelteKit should emit a CSP from kit.csp').toBeTruthy();
		expect(csp).toContain("object-src 'none'");
	});

	test('an invalid or foreign session token is treated as signed out', async ({ page }) => {
		await page.context().addCookies([
			{
				name: 'trailblazers_admin_session',
				value: 'not-a-real-token',
				url: ADMIN_ORIGIN
			}
		]);

		await page.goto(`${ADMIN_ORIGIN}/events`);
		await expect(page).toHaveURL(/\/login$/);
	});

	test('signing out invalidates the session', async ({ page }) => {
		await login(page, ADMIN);
		await page.goto(`${ADMIN_ORIGIN}/`);

		await page.request.post(`${ADMIN_ORIGIN}/logout`, { form: {} });

		await page.goto(`${ADMIN_ORIGIN}/events`);
		await expect(page).toHaveURL(/\/login$/);
	});
});

test.describe('Password links', () => {
	test('an unknown token is refused rather than accepted', async ({ page }) => {
		await page.goto(`${ADMIN_ORIGIN}/set-password?token=made-up-token`);
		await expect(page.getByText('This link is no longer valid')).toBeVisible();
	});

	test('the set-password page is reachable without signing in', async ({ page }) => {
		// An invited user has no password yet, so this must not bounce to /login.
		await page.goto(`${ADMIN_ORIGIN}/set-password?token=made-up-token`);
		await expect(page).not.toHaveURL(/\/login$/);
	});

	test('an admin can mint an invite link for a new account', async ({ page }) => {
		await login(page, ADMIN);

		const unique = `invite-probe-${Date.now()}@example.com`;
		await page.goto(`${ADMIN_ORIGIN}/users`);
		await page.request.post(`${ADMIN_ORIGIN}/users?/saveUser`, {
			form: { fullName: 'Invite Probe', email: unique, role: 'LEADER' }
		});

		// Reissue through the UI path so the returned link is rendered.
		await page.goto(`${ADMIN_ORIGIN}/users`);
		await expect(page.getByText(unique)).toBeVisible();
	});
});

test.describe('Newsletter consent', () => {
	test('an unsubscribe link without a token explains itself', async ({ page }) => {
		await page.goto('http://localhost:5173/unsubscribe');
		await expect(page.getByText('Nothing to unsubscribe')).toBeVisible();
	});

	test('an unknown unsubscribe token is reported, not silently accepted', async ({ page }) => {
		await page.goto('http://localhost:5173/unsubscribe?token=made-up-token');
		await expect(page.getByText('no longer valid')).toBeVisible();
	});

	test('the signup form states what is being consented to', async ({ page }) => {
		await page.goto('http://localhost:5173/');
		await expect(page.getByText(/unsubscribe at any time/i).first()).toBeVisible();
	});
});

test.describe('Public endpoints', () => {
	test('the health endpoint reveals no driver detail', async ({ request }) => {
		for (const origin of ['http://localhost:5173', ADMIN_ORIGIN]) {
			const response = await request.get(`${origin}/api/health`);
			const body = await response.json();

			expect(body).not.toHaveProperty('error');
			expect(Object.keys(body).sort()).toEqual(['app', 'database', 'status', 'timestamp']);
		}
	});

	test('the newsletter endpoint throttles a flood from one address', async () => {
		const context = await playwrightRequest.newContext({ baseURL: 'http://localhost:5173' });

		let throttled = false;
		for (let attempt = 0; attempt < 10; attempt++) {
			const response = await context.post('/api/newsletter', {
				headers: { accept: 'application/json' },
				form: { email: `flood-${attempt}@example.com` }
			});
			if (response.status() === 429) {
				throttled = true;
				break;
			}
		}

		expect(throttled, 'newsletter signups should throttle').toBe(true);
		await context.dispose();
	});

	test('a submission carrying the decoy field is dropped, not stored', async ({ request }) => {
		const response = await request.post('http://localhost:5173/api/newsletter', {
			headers: { accept: 'application/json' },
			form: { email: 'bot@example.com', website: 'http://spam.example' }
		});

		// Accepted-looking, so the bot learns nothing.
		expect(response.status()).toBeLessThan(400);
	});
});
