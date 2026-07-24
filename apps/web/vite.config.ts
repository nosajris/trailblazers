import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			'@trailblazers/ui': path.resolve(__dirname, '../../packages/ui/src')
		}
	},
	ssr: {
		noExternal: ['@trailblazers/core']
	}
});
