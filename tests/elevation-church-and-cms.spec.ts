import { test, expect } from '@playwright/test';

test.describe('Elevation Church Template & Standalone Staff Admin App Verification', () => {
	test('Public Elevation Church Web Routes Load Successfully', async ({ page }) => {
		// Homepage
		await page.goto('/');
		await expect(page).toHaveTitle(/Trailblazers/i);
		await expect(page.locator('text=PLAN A VISIT').first()).toBeVisible();

		// Watch & Messages
		await page.goto('/watch');
		await expect(page.locator('text=WATCH & LISTEN').first()).toBeVisible();

		// Events
		await page.goto('/events');
		await expect(page.locator('text=Events').first()).toBeVisible();

		// Groups
		await page.goto('/groups');
		await expect(page.locator('text=Groups').first()).toBeVisible();

		// Give
		await page.goto('/give');
		await expect(page.locator('text=Give').first()).toBeVisible();
	});

	test('Standalone Staff Admin Portal Security & Login', async ({ page }) => {
		// Admin app runs on port 5174
		await page.goto('http://localhost:5174/');
		await expect(page).toHaveURL(/.*:5174\/login/);
		await expect(page.locator('text=Sign In to Staff Portal')).toBeVisible();
	});
});
