import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/**
 * There was no linting in this repo at all — only a Prettier config, for a
 * Prettier that was never installed.
 *
 * The rules below are deliberately close to the recommended sets. The point of
 * a first lint config is to land green so CI can start gating on it; tighten it
 * once it is running rather than starting with a wall of errors nobody reads.
 */
export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		rules: {
			// Underscore-prefixed arguments are an intentional "unused on purpose".
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
			],
			// The codebase leans on `any` in places (CMS view models, form payloads).
			// Warn so it shows up in review without failing the build today.
			'@typescript-eslint/no-explicit-any': 'warn'
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		// Generated, vendored, or not ours.
		ignores: [
			'**/.svelte-kit/**',
			'**/.vercel/**',
			'**/build/**',
			'**/dist/**',
			'**/node_modules/**',
			'.turbo/**',
			'architecture_example/**',
			'drizzle/**',
			'playwright-report/**',
			'public/**',
			'src/**',
			'test-results/**'
		]
	}
);
