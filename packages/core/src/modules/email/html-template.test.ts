import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emailHtml } from './html-template.js';

test('wraps plain paragraphs in the branded card, escaped', () => {
	const html = emailHtml({ subject: 'Hi', text: 'Hi Jane,\n\nWelcome aboard <script>.' });
	assert.match(html, /Trailblazers/);
	assert.match(html, /Welcome aboard &lt;script&gt;\./);
	assert.doesNotMatch(html, /<script>/);
});

test('turns a bare URL line into a button and a plain-text fallback link', () => {
	const html = emailHtml({ text: 'Hi Jane,\n\nhttps://example.com/confirm\n\n— The team' });
	assert.match(html, /href="https:\/\/example\.com\/confirm"/);
	assert.match(html, /Or paste this address into your browser/);
});

test('an explicit action still renders as a button even with no bare URL in the text', () => {
	const html = emailHtml({ text: 'Hi Jane,\n\nThanks for applying.', action: { label: 'View details', url: 'https://example.com/details' } });
	assert.match(html, /View details/);
	assert.match(html, /href="https:\/\/example\.com\/details"/);
});

test('only the first bare URL becomes a button; a second stays plain text', () => {
	const html = emailHtml({ text: 'https://example.com/one\n\nhttps://example.com/two' });
	const buttons = html.match(/display:inline-block/g) ?? [];
	assert.equal(buttons.length, 1);
	assert.match(html, /example\.com\/two/);
});

test('a sign-off block matching the brand alone is dropped (the header already says who it is from)', () => {
	const html = emailHtml({ text: 'Hi Jane,\n\nSee you soon.\n\nTrailblazers', brand: 'Trailblazers' });
	const bodyParagraphs = html.match(/<p style="margin:0 0 16px/g) ?? [];
	// Two content blocks ("Hi Jane," and "See you soon.") each render; the trailing
	// "Trailblazers" block exactly matches the brand and renders as nothing.
	assert.equal(bodyParagraphs.length, 2);
	assert.doesNotMatch(html, />Trailblazers<\/p>/);
});

test('includes a preheader built from the text with URLs stripped', () => {
	const html = emailHtml({ text: 'Hi Jane,\n\nhttps://example.com/confirm your spot.' });
	assert.match(html, /Hi Jane, your spot\./);
});
