import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			'@trailblazers/ui': path.resolve(__dirname, '../../packages/ui/src'),
			'@trailblazers/core': path.resolve(__dirname, '../../packages/core/src')
		}
	}
};

export default config;
