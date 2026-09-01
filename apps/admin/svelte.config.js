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
		// Stricter than the public site: the portal embeds nothing and loads no
		// third-party media. Other security headers are set in hooks.server.ts.
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				// Required for style *attributes*, which cannot be hashed.
				'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
				'font-src': ['self', 'data:', 'https://fonts.gstatic.com'],
				// Staff paste remote image URLs into CMS fields and preview them here.
				'img-src': ['self', 'data:', 'https:'],
				'connect-src': ['self'],
				'frame-src': ['none'],
				'object-src': ['none'],
				'base-uri': ['self'],
				'form-action': ['self'],
				'frame-ancestors': ['none']
			}
		},
		adapter,
		alias: {
			'@trailblazers/ui': path.resolve(__dirname, '../../packages/ui/src'),
			'@trailblazers/core': path.resolve(__dirname, '../../packages/core/src')
		}
	}
};

export default config;
