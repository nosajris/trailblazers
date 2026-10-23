/**
 * A small, deliberately constrained markdown subset, rendered to safe HTML.
 *
 * Staff-written story and blog content was plain text, rendered with
 * `white-space: pre-line` — no way to bold a word, link a verse, or break a
 * long testimony into paragraphs beyond blank lines. Pulling in a markdown
 * library (and a sanitizer to go with it, since a full markdown grammar
 * includes raw HTML passthrough) would be the usual fix, but every other
 * hand-written-input concern in this codebase — CSV escaping, HMAC signing —
 * is a small, directly testable function with no dependency to audit. This
 * follows the same pattern: HTML-escape first, so nothing staff pastes can
 * ever inject a tag, then apply a handful of safe transforms on top of
 * already-escaped text.
 *
 * Supported, deliberately: paragraphs (blank-line separated), line breaks
 * (single newline), **bold**, *italic*, `[text](url)` for http(s) links
 * only, and `- `/`* ` bullet lists. Anything else — raw HTML, headings,
 * tables, images — is left as literal escaped text rather than silently
 * dropped, so staff always see what they typed even if it isn't one of the
 * handful of things this renders specially.
 */

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/** Only http(s) — never `javascript:`, `data:`, or anything else a pasted link could smuggle in. */
function safeHref(url: string): string | null {
	const trimmed = url.trim();
	return /^https?:\/\//i.test(trimmed) ? escapeHtml(trimmed) : null;
}

/** Inline formatting within an already-escaped line: bold, italic, links. */
function renderInline(escapedLine: string): string {
	return escapedLine
		.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (match, text: string, href: string) => {
			const safe = safeHref(href);
			return safe ? `<a href="${safe}" rel="noopener noreferrer">${text}</a>` : match;
		})
		.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
		.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
}

function isBullet(line: string): boolean {
	return /^[-*]\s+/.test(line);
}

/**
 * Renders one blank-line-delimited block: either a `<ul>` (when every
 * non-empty line in it is a bullet) or a `<p>` with single newlines as
 * `<br>`.
 */
function renderBlock(block: string): string {
	const lines = block.split('\n').filter((line) => line.trim() !== '');
	if (lines.length === 0) return '';

	if (lines.every(isBullet)) {
		const items = lines
			.map((line) => renderInline(escapeHtml(line.replace(/^[-*]\s+/, ''))))
			.map((item) => `<li>${item}</li>`)
			.join('');
		return `<ul>${items}</ul>`;
	}

	const html = lines.map((line) => renderInline(escapeHtml(line))).join('<br>');
	return `<p>${html}</p>`;
}

/** Converts a staff-written plain-text field to safe HTML. Empty input renders nothing. */
export function renderRichText(raw: string | null | undefined): string {
	if (!raw) return '';
	const blocks = raw.replace(/\r\n/g, '\n').split(/\n{2,}/);
	return blocks.map(renderBlock).filter(Boolean).join('');
}
