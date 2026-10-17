import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ogCardSvg, OG_IMAGE_SIZE } from './card.js';

test('produces a valid SVG document at the expected OG size', () => {
	const svg = ogCardSvg({ title: 'Youth Camp 2026' });
	assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
	assert.match(svg, new RegExp(`width="${OG_IMAGE_SIZE.width}" height="${OG_IMAGE_SIZE.height}"`));
	assert.match(svg, /<\/svg>\s*$/);
});

test('includes the title text and defaults the brand to Trailblazers', () => {
	const svg = ogCardSvg({ title: 'Youth Camp 2026' });
	assert.match(svg, /Youth Camp 2026/);
	assert.match(svg, />Trailblazers</);
});

test('a custom brand and kicker both appear, the kicker upper-cased', () => {
	const svg = ogCardSvg({ title: 'Sunday Service', brand: 'PAOZ Trailblazers', kicker: 'sermon' });
	assert.match(svg, />PAOZ Trailblazers</);
	assert.match(svg, />SERMON</);
});

test('escapes HTML-significant characters in the title', () => {
	const svg = ogCardSvg({ title: 'Youth & Teens: <Camp>' });
	assert.doesNotMatch(svg.split('</svg>')[0].replace(/<svg[^>]*>/, ''), /<Camp>/);
	assert.match(svg, /Youth &amp; Teens/);
});

test('an invalid colour falls back to the default rather than producing broken SVG', () => {
	const svg = ogCardSvg({ title: 'X', bg: 'not-a-color' });
	assert.match(svg, /fill="#f95c4b"/);
});

test('a long title wraps across multiple lines rather than overflowing the card', () => {
	const svg = ogCardSvg({ title: 'A Very Long Event Title That Will Not Fit On One Single Line At All' });
	const textLines = svg.match(/<text[^>]*font-size="64"[^>]*>/g) ?? [];
	assert.ok(textLines.length >= 2);
});
