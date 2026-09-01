/**
 * Characters that make a spreadsheet treat a cell as a formula rather than
 * text. Tab and carriage return are included because Excel strips leading
 * whitespace before deciding, so `\t=cmd|...` still executes.
 */
const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Neutralizes spreadsheet formula injection.
 *
 * Exports carry text typed by anonymous visitors or staff. A cell beginning
 * `=HYPERLINK(...)` or `=cmd|...` runs when opened in a spreadsheet, so the value
 * is prefixed with an apostrophe — the convention Excel, LibreOffice and Sheets
 * read as "this is text".
 */
export function escapeCsvValue(value: unknown): string {
	if (value === null || value === undefined) return '';

	const raw = String(value);
	if (raw.length === 0) return '';

	return FORMULA_TRIGGERS.includes(raw[0]) ? `'${raw}` : raw;
}

/** Renders one cell: formula-safe, then quoted and internally escaped. */
export function toCsvCell(value: unknown): string {
	return `"${escapeCsvValue(value).replace(/"/g, '""')}"`;
}
