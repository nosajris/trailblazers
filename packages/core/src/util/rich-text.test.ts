import test from 'node:test';
import assert from 'node:assert/strict';
import { renderRichText } from './rich-text.js';

test('empty or missing input renders nothing', () => {
	assert.equal(renderRichText(null), '');
	assert.equal(renderRichText(undefined), '');
	assert.equal(renderRichText(''), '');
});

test('a blank line starts a new paragraph; a single newline is a line break', () => {
	assert.equal(renderRichText('First line.\nSecond line.\n\nSecond paragraph.'), '<p>First line.<br>Second line.</p><p>Second paragraph.</p>');
});

test('bold and italic render, and survive side by side', () => {
	assert.equal(renderRichText('**bold** and *italic*'), '<p><strong>bold</strong> and <em>italic</em></p>');
});

test('a link to an http(s) url renders as an anchor with rel=noopener', () => {
	assert.equal(
		renderRichText('Read [John 3:16](https://bible.com/jn/3/16) for the full verse.'),
		'<p>Read <a href="https://bible.com/jn/3/16" rel="noopener noreferrer">John 3:16</a> for the full verse.</p>'
	);
});

test('a non-http(s) link target is left as literal escaped text, not an anchor', () => {
	assert.equal(
		renderRichText('[click me](javascript:alert(1))'),
		'<p>[click me](javascript:alert(1))</p>'
	);
});

test('raw HTML pasted into the field is escaped, never executed', () => {
	assert.equal(
		renderRichText('<script>alert(1)</script> & "quoted"'),
		'<p>&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;quoted&quot;</p>'
	);
});

test('a block of bullet lines renders as a list, not a paragraph', () => {
	assert.equal(
		renderRichText('- First point\n- Second point\n* Third point (asterisk bullet too)'),
		'<ul><li>First point</li><li>Second point</li><li>Third point (asterisk bullet too)</li></ul>'
	);
});

test('a mixed block (not every line a bullet) stays a paragraph with line breaks', () => {
	assert.equal(
		renderRichText('Intro line\n- not actually a list here'),
		'<p>Intro line<br>- not actually a list here</p>'
	);
});

test('three or more consecutive blank lines collapse to one paragraph break', () => {
	assert.equal(renderRichText('One.\n\n\n\nTwo.'), '<p>One.</p><p>Two.</p>');
});
