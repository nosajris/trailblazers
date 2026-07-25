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
		alias: {
			'@trailblazers/ui': path.resolve(__dirname, '../../packages/ui/src'),
			'@trailblazers/core': path.resolve(__dirname, '../../packages/core/src')
		}
	}
};

export default config;
