/**
 * Rasterizes the OG card's SVG to a PNG buffer. Separated from `card.ts` so
 * that module stays pure and testable without pulling `sharp` into tests
 * that only check the SVG's shape — this file is the one untested seam,
 * same as the sharp calls in media/service.ts.
 */
import sharp from 'sharp';
import { OG_IMAGE_SIZE } from './card.js';

export async function renderOgCard(svg: string): Promise<Buffer> {
	return sharp(Buffer.from(svg), { density: 144 })
		.resize(OG_IMAGE_SIZE.width, OG_IMAGE_SIZE.height)
		.png()
		.toBuffer();
}
