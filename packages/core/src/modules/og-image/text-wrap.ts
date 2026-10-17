/**
 * Wraps `text` into at most `maxLines` lines of roughly `maxCharsPerLine`
 * characters each, breaking on word boundaries. Used to lay out a title in
 * the generated OG card without a real text-layout engine — sharp rasterizes
 * the SVG this produces, but doesn't measure text for us, so the wrapping
 * has to happen before the SVG is built.
 *
 * The last line is truncated with an ellipsis if there's more text than
 * `maxLines` lines can hold, rather than silently dropping it.
 */
export function wrapLines(text: string, maxCharsPerLine: number, maxLines: number): string[] {
	const words = text.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return [];

	const lines: string[] = [];
	let current = '';

	for (const word of words) {
		const withWord = current ? `${current} ${word}` : word;
		if (withWord.length <= maxCharsPerLine) {
			current = withWord;
			continue;
		}
		if (current) lines.push(current);
		current = word;
		if (lines.length === maxLines) break;
	}
	if (current && lines.length < maxLines) lines.push(current);

	if (lines.length > maxLines) lines.length = maxLines;

	const consumedWords = lines.join(' ').split(/\s+/).length;
	const isTruncated = consumedWords < words.length && lines.length === maxLines;
	if (isTruncated) {
		const last = lines[maxLines - 1];
		lines[maxLines - 1] = last.length > 1 ? `${last.replace(/[.,;:!?]+$/, '')}…` : last;
	}

	return lines;
}
