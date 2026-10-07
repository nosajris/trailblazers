import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Guards the boundary between browser code and the server graph.
 *
 * `@trailblazers/core`'s root export re-exports the database client and the IAM
 * service, which import `postgres` and `node:crypto`. A type-only import from
 * the root is erased at compile time and costs nothing, but importing a *value*
 * from it out of browser code pulls that whole graph into the client bundle —
 * which fails the production build with "performance is not exported by
 * __vite-browser-external", from `postgres` reaching for `perf_hooks`.
 *
 * Browser code therefore takes values only from the modules listed in
 * CLIENT_SAFE below, which import nothing at all. Both apps alias the package
 * to its `src` directory in `vite.config.ts`, so a deep import has to match the
 * real layout — and that alias also means a deep import of, say, the db client
 * would compile and then break the build, which is why the allowlist exists
 * rather than a rule about the root alone.
 *
 * `svelte-check` cannot catch any of this: it is a bundling concern, so
 * `npm run build` is the gate.
 */
const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

/** Components are always partly browser code; so is everything in the UI package. */
const SCAN = [
	{ dir: 'apps/web/src', extensions: ['.svelte'] },
	{ dir: 'apps/admin/src', extensions: ['.svelte'] },
	{ dir: 'packages/ui/src', extensions: ['.svelte', '.ts'] }
];

/**
 * Deep imports from core that are safe in the browser: these modules are pure
 * and import nothing. Add to this list only after checking the same is true.
 */
const CLIENT_SAFE = [
	'@trailblazers/core/modules/settings/site-content',
	'@trailblazers/core/modules/pages/section-types'
];

/** Server-only files may import whatever they like. */
function isServerOnly(path: string): boolean {
	const unix = path.replace(/\\/g, '/');
	return (
		unix.includes('/lib/server/') ||
		unix.includes('/routes/api/') ||
		/\.server\.ts$/.test(unix) ||
		/\/hooks\.server\.ts$/.test(unix) ||
		/\.test\.ts$/.test(unix)
	);
}

function walk(dir: string, extensions: string[], found: string[] = []): string[] {
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) walk(path, extensions, found);
		else if (extensions.some((ext) => entry.endsWith(ext))) found.push(path);
	}
	return found;
}

/**
 * Import statements that take at least one value from the core package root.
 *
 * Every import is matched up to its own `from '...'`, because matches are
 * sequential and non-overlapping. Anchoring on the module instead would let a
 * lazy clause run across two statements and report the wrong one.
 */
function rootValueImports(source: string): string[] {
	const pattern = /import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
	const offenders: string[] = [];

	for (const match of source.matchAll(pattern)) {
		const [statement, clause, module] = match;
		if (!module.startsWith('@trailblazers/core')) continue;
		// `import type { A }` is erased at compile time and costs nothing.
		if (/^type\b/.test(clause)) continue;
		if (CLIENT_SAFE.includes(module)) continue;

		const names = clause
			.replace(/^\{|\}$/g, '')
			.split(',')
			.map((name) => name.trim())
			.filter((name) => name.length > 0);

		// `import { type A, type B }` is erased too; anything else is a value.
		if (names.some((name) => !name.startsWith('type '))) offenders.push(statement.split('\n')[0]);
	}

	return offenders;
}

test('browser code takes core values only from the client-safe modules', () => {
	const offenders: string[] = [];

	for (const { dir, extensions } of SCAN) {
		for (const file of walk(join(REPO_ROOT, dir), extensions)) {
			if (isServerOnly(file)) continue;
			for (const statement of rootValueImports(readFileSync(file, 'utf8'))) {
				offenders.push(`  ${file.replace(REPO_ROOT, '')}\n    ${statement}`);
			}
		}
	}

	assert.deepEqual(
		offenders,
		[],
		'Browser code must not take a runtime import from @trailblazers/core.\n' +
			`Import the value as a type, or add it to one of: ${CLIENT_SAFE.join(', ')}.\n` +
			'Offenders:\n' +
			offenders.join('\n')
	);
});

test('the rule matches values, ignores types, and allows the safe modules', () => {
	assert.deepEqual(rootValueImports("import type { A } from '@trailblazers/core';"), []);
	assert.deepEqual(rootValueImports("import { type A, type B } from '@trailblazers/core';"), []);
	assert.deepEqual(
		rootValueImports("import { telHref } from '@trailblazers/core/modules/settings/site-content';"),
		[]
	);
	assert.equal(rootValueImports("import { telHref } from '@trailblazers/core';").length, 1);
	assert.equal(rootValueImports("import { telHref, type A } from '@trailblazers/core';").length, 1);
	assert.equal(rootValueImports("import {\n\tcampusesToText\n} from '@trailblazers/core';").length, 1);

	// A deep import that is not on the list is the build break this guards.
	assert.equal(rootValueImports("import { db } from '@trailblazers/core/db/client';").length, 1);
	assert.equal(
		rootValueImports("import { createIamService } from '@trailblazers/core/modules/iam/service';").length,
		1
	);

	// Other packages are none of this rule's business.
	assert.deepEqual(rootValueImports("import { whatsappShareUrl } from '@trailblazers/ui/site/share';"), []);
});
