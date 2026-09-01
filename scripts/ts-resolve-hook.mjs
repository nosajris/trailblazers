/**
 * Lets Node run the TypeScript sources directly.
 *
 * The problem: this codebase follows the TypeScript convention of writing
 * relative imports with a `.js` extension (`import { Sanitizer } from
 * './sanitizer.js'`), which the compiler resolves to `./sanitizer.ts`. Node's
 * built-in type stripping does not rewrite specifiers, so running a test that
 * imports one of those modules fails with ERR_MODULE_NOT_FOUND.
 *
 * This hook closes that gap: when a relative `.js` specifier does not exist on
 * disk but the matching `.ts` does, it resolves to the `.ts` instead. It only
 * ever redirects when the `.js` file is genuinely absent, so real JavaScript
 * files are untouched.
 *
 * With this, `npm test` can exercise any module in packages/core — including
 * the services, which had no test coverage at all.
 */

import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
	const isRelative = specifier.startsWith('./') || specifier.startsWith('../');

	if (isRelative && specifier.endsWith('.js')) {
		try {
			const resolved = new URL(specifier, context.parentURL);
			const jsPath = fileURLToPath(resolved);

			if (!existsSync(jsPath)) {
				const tsPath = jsPath.replace(/\.js$/, '.ts');

				if (existsSync(tsPath)) {
					return nextResolve(specifier.replace(/\.js$/, '.ts'), context);
				}
			}
		} catch {
			// Fall through to the default resolver on anything unexpected.
		}
	}

	return nextResolve(specifier, context);
}
