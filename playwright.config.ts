import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	/**
	 * Both apps, not just web.
	 *
	 * Only the web server used to be started here, while `admin-styles.spec.ts`
	 * and the security suite address `localhost:5174` with absolute URLs — so
	 * those specs failed unless someone had remembered to run `npm run dev:admin`
	 * in another terminal.
	 */
	webServer: [
		{
			command: 'npm run dev:web',
			url: 'http://localhost:5173',
			reuseExistingServer: !process.env.CI,
			timeout: 120 * 1000
		},
		{
			command: 'npm run dev:admin',
			url: 'http://localhost:5174/login',
			reuseExistingServer: !process.env.CI,
			timeout: 120 * 1000
		}
	]
});
