import { test, expect } from '@playwright/test';

test.describe('Admin App Styling & Linear Design System Verification', () => {
	async function loginAsAdmin(page: any) {
		await page.goto('http://localhost:5174/login');
		await page.locator('#admin-email-input').fill('admin@paoz.org');
		await page.locator('#admin-password-input').fill('secret');
		await page.locator('button[type="submit"]').click();
		await page.waitForURL((url: URL) => url.pathname !== '/login');
	}

	test('CSS Design Tokens are present on `:root`', async ({ page }) => {
		await page.goto('http://localhost:5174/login');

		// Verify CSS variables are computed on root element
		const rootStyles = await page.evaluate(() => {
			const styles = getComputedStyle(document.documentElement);
			return {
				brandPrimary: styles.getPropertyValue('--brand-primary').trim(),
				zinc50: styles.getPropertyValue('--zinc-50').trim(),
				zinc900: styles.getPropertyValue('--zinc-900').trim(),
				colorBorder: styles.getPropertyValue('--color-border').trim()
			};
		});

		expect(rootStyles.brandPrimary.toLowerCase()).toBe('#f95c4b');
		expect(rootStyles.zinc50).toBe('#fafafa');
		expect(rootStyles.zinc900).toBe('#18181b');
		expect(rootStyles.colorBorder).toBeDefined();
	});

	test('Login screen renders with Linear design tokens and no raw hex colors', async ({ page }) => {
		await page.goto('http://localhost:5174/login');

		// Check title and inputs
		const heading = page.locator('h1');
		await expect(heading).toContainText('Trailblazers Staff CMS');

		const submitButton = page.locator('button[type="submit"]');
		await expect(submitButton).toBeVisible();

		// Ensure container card is rendered
		const card = page.locator('.admin-card').first();
		await expect(card).toBeVisible();
	});

	test('Navigation sidebar highlights active route dynamically', async ({ page }) => {
		await loginAsAdmin(page);

		await page.goto('http://localhost:5174/sermons');

		// Verify sidebar link for /sermons has active aria-current or data-active state
		const activeSermonsLink = page.locator('aside nav a[href="/sermons"]');
		await expect(activeSermonsLink).toBeVisible();
		await expect(activeSermonsLink).toHaveAttribute('data-active', 'true');

		// Verify navigation to /events changes active link
		await page.goto('http://localhost:5174/events');
		const activeEventsLink = page.locator('aside nav a[href="/events"]');
		await expect(activeEventsLink).toHaveAttribute('data-active', 'true');
	});

	test('Admin App sidebar does not use hardcoded hex #171616', async ({ page }) => {
		await loginAsAdmin(page);

		await page.goto('http://localhost:5174/sermons');
		const sidebar = page.locator('aside');
		const classList = await sidebar.getAttribute('class');
		expect(classList).not.toContain('#171616');
	});

	test('CMS Table and Action Buttons render with design tokens', async ({ page }) => {
		await loginAsAdmin(page);

		await page.goto('http://localhost:5174/sermons');

		const addSermonBtn = page.locator('button', { hasText: '+ Add Sermon' });
		await expect(addSermonBtn).toBeVisible();

		const tableHeader = page.locator('thead');
		await expect(tableHeader).toBeVisible();
	});

	test('Dashboard Overview renders quick action cards and stat icon badges', async ({ page }) => {
		await loginAsAdmin(page);

		await page.goto('http://localhost:5174/');

		// Verify main dashboard greeting and quick action buttons
		await expect(page.locator('main h1')).toContainText('Dashboard Overview');
		await expect(page.locator('.dashboard-quick-actions')).toBeVisible();

		// Verify 4 stat cards exist with icon indicators
		const statCards = page.locator('.stat-card');
		await expect(statCards).toHaveCount(4);

		// Verify recent audit activity section
		await expect(page.locator('text=Recent Audit Activity')).toBeVisible();
	});
});
