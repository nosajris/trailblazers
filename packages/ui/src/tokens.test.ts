/**
 * Design token guardrails.
 *
 *   npm test
 *
 * Two jobs:
 *  1. Keep the hex and RGB-channel forms of each token in agreement. They exist
 *     separately because Tailwind's opacity modifiers need channels, and
 *     nothing but this test stops them drifting apart.
 *  2. Ratchet the number of hardcoded colours down. The colour rule in
 *     `.agents/rules/code-style.md` had no enforcement, and 60-odd literals
 *     accumulated behind it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const REPO_ROOT = resolve(import.meta.dirname, '../../..');
const TOKENS_PATH = join(REPO_ROOT, 'packages/ui/src/tokens.css');

const tokensCss = readFileSync(TOKENS_PATH, 'utf8');

function hexToChannels(hex: string): [number, number, number] {
	const value = hex.replace('#', '');
	const full =
		value.length === 3
			? value
					.split('')
					.map((c) => c + c)
					.join('')
			: value;
	return [
		parseInt(full.slice(0, 2), 16),
		parseInt(full.slice(2, 4), 16),
		parseInt(full.slice(4, 6), 16)
	];
}

test('every --x-rgb channel triplet matches its --x hex', () => {
	const hexTokens = new Map<string, string>();
	const rgbTokens = new Map<string, string>();

	for (const line of tokensCss.split('\n')) {
		const hexMatch = line.match(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/);
		if (hexMatch) hexTokens.set(hexMatch[1], hexMatch[2]);

		const rgbMatch = line.match(/--([a-z0-9-]+)-rgb:\s*([0-9]+ [0-9]+ [0-9]+)\s*;/);
		if (rgbMatch) rgbTokens.set(rgbMatch[1], rgbMatch[2]);
	}

	assert.ok(rgbTokens.size > 0, 'expected channel tokens to exist');

	for (const [name, channels] of rgbTokens) {
		const hex = hexTokens.get(name);
		assert.ok(hex, `--${name}-rgb has no matching --${name} hex`);

		const expected = hexToChannels(hex).join(' ');
		assert.equal(
			channels,
			expected,
			`--${name}-rgb (${channels}) disagrees with --${name} (${hex} -> ${expected})`
		);
	}
});

test('the tokens both apps rely on are all defined', () => {
	for (const token of [
		'--brand-primary',
		'--brand-primary-hover',
		'--brand-fg',
		'--color-border',
		'--color-bg-surface',
		'--color-danger-fg',
		'--zinc-50',
		'--zinc-900'
	]) {
		assert.ok(tokensCss.includes(`${token}:`), `${token} is missing from tokens.css`);
	}
});

test('neither app redeclares the token block', () => {
	// The drift this prevents: admin used to define its own copy of every
	// token inline, and --brand-primary-hover fell out of sync.
	for (const appCss of ['apps/admin/src/app.css', 'apps/web/src/app.css']) {
		const css = readFileSync(join(REPO_ROOT, appCss), 'utf8');
		assert.ok(
			!css.includes('--brand-primary:'),
			`${appCss} redefines --brand-primary; it should import tokens.css instead`
		);
		assert.ok(
			css.includes('@trailblazers/ui/tokens.css'),
			`${appCss} should import the shared token file`
		);
	}
});

/* ------------------------------------------------------------------ */

const SCAN_DIRS = ['apps/web/src', 'apps/admin/src', 'packages/ui/src'];
const SCAN_FILES = ['apps/web/tailwind.config.ts', 'apps/admin/tailwind.config.ts'];
const SCAN_EXTENSIONS = ['.svelte', '.css', '.ts'];
const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/g;

function walk(dir: string, found: string[] = []): string[] {
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) {
			walk(path, found);
		} else if (SCAN_EXTENSIONS.some((ext) => entry.endsWith(ext))) {
			found.push(path);
		}
	}
	return found;
}

function countHardcodedHexes(): { total: number; byFile: Map<string, number> } {
	const byFile = new Map<string, number>();
	let total = 0;

	const files = [
		...SCAN_DIRS.flatMap((dir) => walk(join(REPO_ROOT, dir))),
		...SCAN_FILES.map((file) => join(REPO_ROOT, file))
	];

	for (const file of files) {
		// The token file is the one place a literal colour belongs.
		if (file.endsWith('tokens.css')) continue;
		// This file quotes hex values in its own assertions.
		if (file.endsWith('tokens.test.ts')) continue;

		const matches = readFileSync(file, 'utf8').match(HEX_PATTERN);
		if (matches?.length) {
			byFile.set(file.replace(REPO_ROOT + '/', ''), matches.length);
			total += matches.length;
		}
	}

	return { total, byFile };
}

/**
 * Ratchet. Lower this as colours move into tokens.css; never raise it.
 *
 * A failure here means a new hardcoded colour was added. The fix is to use a
 * token from `packages/ui/src/tokens.css` — not to edit this number. The
 * remaining literals are concentrated in `apps/admin/src/routes/+layout.svelte`.
 */
const MAX_HARDCODED_HEXES = 50;

test('the hardcoded colour count does not rise', () => {
	const { total, byFile } = countHardcodedHexes();

	const breakdown = [...byFile.entries()]
		.sort((a, b) => b[1] - a[1])
		.map(([file, count]) => `  ${String(count).padStart(3)}  ${file}`)
		.join('\n');

	assert.ok(
		total <= MAX_HARDCODED_HEXES,
		`Hardcoded colours rose to ${total} (limit ${MAX_HARDCODED_HEXES}).\n` +
			`Use a token from packages/ui/src/tokens.css instead of a literal.\n` +
			`Do not raise the limit.\n${breakdown}`
	);
});

test('the ratchet is tightened when colours are migrated', () => {
	const { total } = countHardcodedHexes();

	assert.ok(
		total >= MAX_HARDCODED_HEXES - 10,
		`Hardcoded colours dropped to ${total}, well under the limit of ${MAX_HARDCODED_HEXES}. ` +
			`Lower MAX_HARDCODED_HEXES in this file to lock the improvement in.`
	);
});
