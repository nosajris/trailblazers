/**
 * CSV export.
 *
 * Kept import-free so the escaping is directly testable — see
 * `service.test.ts`, run with Node's built-in runner.
 */

/**
 * Characters that make a spreadsheet treat a cell as a formula rather than
 * text. Tab and carriage return are included because Excel strips leading
 * whitespace before deciding, so `\t=cmd|...` still executes.
 */
const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Neutralizes spreadsheet formula injection.
 *
 * Exports carry text typed by anonymous visitors through the contact and
 * volunteer forms. A cell beginning `=HYPERLINK(...)` or `=cmd|...` runs when
 * a staff member opens the file, so the value is prefixed with an apostrophe —
 * the convention Excel, LibreOffice and Sheets all read as "this is text".
 *
 * Quoting alone does not help: the quotes are consumed by the CSV parser
 * before the spreadsheet ever inspects the value.
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

export function createExportService() {
	return {
		arrayToCsv<T extends Record<string, any>>(data: T[]): string {
			if (!data || data.length === 0) return '';

			const headers = Object.keys(data[0]);
			const csvRows: string[] = [];

			csvRows.push(headers.map(toCsvCell).join(','));

			for (const row of data) {
				csvRows.push(headers.map((header) => toCsvCell(row[header])).join(','));
			}

			return csvRows.join('\n');
		}
	};
}
