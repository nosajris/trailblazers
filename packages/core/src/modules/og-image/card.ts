/**
 * The branded card drawn when a page has no uploaded photo of its own — an
 * event, sermon, or story shared into WhatsApp or Facebook with nothing but
 * the generic site wallpaper and no indication of what's actually being
 * shared. One SVG template, rasterized to a PNG by `/og` (see render.ts and
 * the route), standing in only until staff upload a real photo.
 *
 * Deliberately simple: no custom fonts (sharp's SVG rasterizer only has
 * what's installed on the server, and a missing font fails silently to a
 * system default anyway) and no photography — just the organization name,
 * an optional kicker ("Event" / "Sermon"), and the title, wrapped by hand
 * since nothing here measures text for us.
 */
import { wrapLines } from './text-wrap.js';

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export type OgCardInput = {
	title: string;
	kicker?: string;
	brand?: string;
	/** Hex, no '#'. */
	bg?: string;
	ink?: string;
	accent?: string;
};

const HEX6 = /^[0-9a-f]{6}$/i;

function esc(value: string): string {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function clean(value: string | undefined, max: number): string {
	return String(value ?? '')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, max)
		.trim();
}

function hex(value: string | undefined, fallback: string): string {
	const v = String(value ?? '').replace(/^#/, '');
	return `#${HEX6.test(v) ? v.toLowerCase() : fallback}`;
}

/** The OG card as a complete SVG document (1200x630), ready for a rasterizer. */
export function ogCardSvg(input: OgCardInput): string {
	const title = clean(input.title, 140);
	const kicker = clean(input.kicker, 40);
	const brand = clean(input.brand, 60) || 'Trailblazers';
	const bg = hex(input.bg, 'f95c4b');
	const ink = hex(input.ink, 'ffffff');
	const accent = hex(input.accent, 'ffffff');

	const lines = wrapLines(title || brand, 24, 3);
	const lineHeight = 76;
	const titleTop = kicker ? 300 : 340;

	const titleLines = lines
		.map(
			(line, i) =>
				`<text x="80" y="${titleTop + i * lineHeight}" font-family="sans-serif" font-weight="700" font-size="64" fill="${ink}">${esc(line)}</text>`
		)
		.join('\n\t\t');

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_IMAGE_SIZE.width}" height="${OG_IMAGE_SIZE.height}" viewBox="0 0 ${OG_IMAGE_SIZE.width} ${OG_IMAGE_SIZE.height}">
		<rect width="100%" height="100%" fill="${bg}"/>
		<circle cx="1120" cy="80" r="260" fill="${accent}" fill-opacity="0.08"/>
		<circle cx="60" cy="610" r="180" fill="${accent}" fill-opacity="0.08"/>
		<text x="80" y="110" font-family="sans-serif" font-weight="800" font-size="34" fill="${ink}" fill-opacity="0.9">${esc(brand)}</text>
		${kicker ? `<text x="80" y="220" font-family="sans-serif" font-weight="700" font-size="26" letter-spacing="4" fill="${accent}">${esc(kicker.toUpperCase())}</text>` : ''}
		${titleLines}
	</svg>`;
}
