import fs from 'node:fs';
import path from 'node:path';

const webOutput = path.resolve('apps/web/.vercel/output');
const rootOutput = path.resolve('.vercel/output');

if (fs.existsSync(webOutput)) {
	fs.mkdirSync(rootOutput, { recursive: true });
	fs.cpSync(webOutput, rootOutput, { recursive: true });
	console.log('[Vercel Build] Successfully copied apps/web/.vercel/output to root .vercel/output!');
} else {
	console.log('[Vercel Build] Web output directory not found at apps/web/.vercel/output');
}
