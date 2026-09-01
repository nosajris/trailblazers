import adapterVercel from '@sveltejs/adapter-vercel';
import adapterAuto from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use adapter-vercel on CI/Vercel (Linux), adapter-auto locally (Windows symlink compat)
const isCI = !!(process.env.VERCEL || process.env.CI);
const adapter = isCI ? adapterVercel() : adapterAuto();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter,
		// SvelteKit builds this header itself so it can hash its own inline
		// hydration scripts. The other security headers are set in
		// hooks.server.ts; frame-ancestors is covered there by X-Frame-Options.
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				// 'unsafe-inline' is required for style *attributes* — app.html uses
				// `style="display: contents"`, and attributes cannot be hashed.
				// Google Fonts serves the stylesheet itself.
				'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
				'font-src': ['self', 'data:', 'https://fonts.gstatic.com'],
				// CMS fields hold arbitrary image URLs entered by staff, so remote
				// https images have to be allowed.
				'img-src': ['self', 'data:', 'https:'],
				'media-src': ['self', 'data:', 'https:'],
				'connect-src': ['self'],
				// The service worker and the web app manifest. Without these the
				// PWA registration is blocked by the policy.
				'worker-src': ['self'],
				'manifest-src': ['self'],
				// Sermon and hero embeds.
				'frame-src': [
					'self',
					'https://www.youtube-nocookie.com',
					'https://www.youtube.com',
					'https://maps.google.com',
					'https://www.google.com'
				],
				'object-src': ['none'],
				'base-uri': ['self'],
				'form-action': ['self'],
				'frame-ancestors': ['none']
			}
		},
		alias: {
			'@trailblazers/ui': path.resolve(__dirname, '../../packages/ui/src'),
			'@trailblazers/core': path.resolve(__dirname, '../../packages/core/src')
		}
	}
};

export default config;
