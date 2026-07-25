import fs from 'node:fs';
import path from 'node:path';

const webVercelOutput = path.resolve('apps/web/.vercel/output');
const webSvelteKitClient = path.resolve('apps/web/.svelte-kit/output/client');

const rootVercelOutput = path.resolve('.vercel/output');
const rootPublic = path.resolve('public');

// 1. Sync .vercel/output for Vercel SvelteKit Serverless adapter
if (fs.existsSync(webVercelOutput)) {
	fs.mkdirSync(rootVercelOutput, { recursive: true });
	fs.cpSync(webVercelOutput, rootVercelOutput, { recursive: true });
	console.log('✅ [Vercel Build] Successfully copied apps/web/.vercel/output to root .vercel/output!');
}

// 2. Sync client assets to root public directory for fallback static detector
if (fs.existsSync(webSvelteKitClient)) {
	fs.mkdirSync(rootPublic, { recursive: true });
	fs.cpSync(webSvelteKitClient, rootPublic, { recursive: true });
	console.log('✅ [Vercel Build] Successfully copied client assets to root public directory!');
}
