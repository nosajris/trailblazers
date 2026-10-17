import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [sveltekit()],
	// Binds to the IPv4 loopback explicitly rather than 'localhost', which
	// Node/Vite resolve to the IPv6 ::1 first — on some Windows machines
	// (NAT port-range exhaustion from Docker/WSL, or a stray firewall rule)
	// binding to ::1 fails with EACCES while 127.0.0.1 works fine.
	server: {
		host: '127.0.0.1'
	},
	resolve: {
		alias: {
			'@trailblazers/ui': path.resolve(__dirname, '../../packages/ui/src'),
			'@trailblazers/core': path.resolve(__dirname, '../../packages/core/src')
		}
	},
	ssr: {
		noExternal: ['@trailblazers/core', '@trailblazers/ui']
	}
});
