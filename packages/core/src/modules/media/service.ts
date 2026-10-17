import sharp from 'sharp';
import { put, del } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import type { Database } from '../../db/client.js';
import { createMediaRepository } from './repository.js';
import { validateUpload } from './validation.js';
import { clampToLongEdge, variantWidthsFor, MAX_LONG_EDGE } from './dimensions.js';
import type { MediaAsset } from './types.js';

const WEBP_QUALITY = 82;

export type UploadInput = {
	buffer: Buffer;
	mimeType: string;
	size: number;
};

/**
 * Turns a staff upload into a capped-size webp plus smaller variants, all
 * stored on Vercel Blob. Every file name ends `-<width>.webp`, so the CMS
 * branch of `responsiveSrcset` (`packages/ui/src/site/responsive-images.ts`)
 * can derive the srcset from `url` alone — no second lookup at render time.
 */
export function createMediaService(db: Database) {
	const repo = createMediaRepository(db);

	return {
		async upload(file: UploadInput, uploadedBy?: number): Promise<MediaAsset> {
			const problem = validateUpload(file);
			if (problem) throw new Error(problem.message);

			// .rotate() with no argument bakes in the EXIF orientation; sharp
			// drops the rest of the metadata (camera, GPS) by default unless
			// .withMetadata() is called, so there is nothing further to strip.
			const oriented = sharp(file.buffer).rotate();
			const sourceMeta = await oriented.metadata();
			const target = clampToLongEdge(sourceMeta.width ?? 0, sourceMeta.height ?? 0, MAX_LONG_EDGE);

			const fullPipeline = target.resize
				? oriented.resize({ width: target.width, height: target.height, withoutEnlargement: true })
				: oriented;
			const fullBuffer = await fullPipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
			const fullMeta = await sharp(fullBuffer).metadata();
			const fullWidth = fullMeta.width ?? target.width;
			const fullHeight = fullMeta.height ?? target.height;

			const key = `cms/${randomUUID()}`;
			const fullBlob = await put(`${key}-${fullWidth}.webp`, fullBuffer, {
				access: 'public',
				contentType: 'image/webp'
			});

			const variants: Record<string, string> = {};
			for (const width of variantWidthsFor(fullWidth)) {
				const variantBuffer = await sharp(fullBuffer)
					.resize({ width, withoutEnlargement: true })
					.webp({ quality: WEBP_QUALITY })
					.toBuffer();
				const variantBlob = await put(`${key}-${width}.webp`, variantBuffer, {
					access: 'public',
					contentType: 'image/webp'
				});
				variants[String(width)] = variantBlob.url;
			}

			const saved = await repo.insert({
				url: fullBlob.url,
				width: fullWidth,
				height: fullHeight,
				variants,
				uploadedBy
			});

			return {
				id: saved.id,
				url: saved.url,
				width: saved.width,
				height: saved.height,
				variants: saved.variants
			};
		},

		/** Best-effort: a dangling blob costs storage, not correctness, so a failed delete there doesn't block the record removal. */
		async deleteAsset(id: number, url: string, variants: Record<string, string>) {
			await Promise.all(
				[url, ...Object.values(variants)].map((u) => del(u).catch(() => undefined))
			);
			await repo.delete(id);
		},

		/**
		 * Recent uploads for the staff media picker — lets a photo already on
		 * Blob be reused in a second field instead of uploaded again.
		 */
		async listRecent(limit = 24): Promise<MediaAsset[]> {
			const rows = await repo.listRecent(limit);
			return rows.map((row) => ({
				id: row.id,
				url: row.url,
				width: row.width,
				height: row.height,
				variants: row.variants
			}));
		}
	};
}
