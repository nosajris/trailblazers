/**
 * Media storage.
 *
 * `imageUrl` and `avatarUrl` are raw text fields today: staff paste a URL from
 * somewhere else and hope it stays up. This is the seam that replaces that.
 *
 * The adapter exists because **the production backend is not decided yet**
 * (Vercel Blob, S3/R2, or Cloudinary — see docs/BACKLOG.md). Everything above
 * this interface is written once; swapping the backend is one implementation.
 *
 * Validation is here rather than in an adapter so every backend enforces the
 * same rules, and so it can be tested without any of them.
 */

export type StoredFile = {
	/** Opaque key the adapter uses to find the file again. */
	key: string;
	/** Public URL for rendering. */
	url: string;
	contentType: string;
	sizeBytes: number;
};

export type StorageAdapter = {
	put(input: { key: string; body: ArrayBuffer; contentType: string }): Promise<StoredFile>;
	delete(key: string): Promise<void>;
	/** Public URL for a key, without a round trip. */
	urlFor(key: string): string;
};

/**
 * What may be uploaded.
 *
 * SVG is deliberately excluded: it is executable — it can carry script and
 * foreign objects — and these files are served from the site's own origin,
 * where the CSP would treat them as first-party.
 */
export const ALLOWED_IMAGE_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/avif',
	'image/gif'
] as const;

/** 5 MB. Generous for a photo, small enough to refuse a video by accident. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type ValidationResult = { ok: true } | { ok: false; reason: string };

export function validateUpload(file: { type: string; size: number }): ValidationResult {
	if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
		return {
			ok: false,
			reason: `That file type is not allowed. Use a JPEG, PNG, WebP, AVIF or GIF image.`
		};
	}

	if (file.size <= 0) {
		return { ok: false, reason: 'That file is empty.' };
	}

	if (file.size > MAX_UPLOAD_BYTES) {
		const mb = (MAX_UPLOAD_BYTES / 1024 / 1024).toFixed(0);
		return { ok: false, reason: `That file is too large. The limit is ${mb} MB.` };
	}

	return { ok: true };
}

/**
 * Builds a safe storage key from an original filename.
 *
 * The original name is never trusted: it can carry path traversal, control
 * characters, or a second extension. Only the extension is kept, and the name
 * is randomised so two uploads called `photo.jpg` cannot collide or overwrite
 * each other.
 */
export function buildStorageKey(
	originalName: string,
	contentType: string,
	randomId: string,
	now: Date = new Date()
): string {
	const extensionByType: Record<string, string> = {
		'image/jpeg': 'jpg',
		'image/png': 'png',
		'image/webp': 'webp',
		'image/avif': 'avif',
		'image/gif': 'gif'
	};

	// Derived from the content type, not from whatever the filename claimed.
	const extension = extensionByType[contentType] ?? 'bin';

	const stem =
		originalName
			.replace(/\.[^.]*$/, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 40) || 'file';

	const yyyy = now.getUTCFullYear();
	const mm = String(now.getUTCMonth() + 1).padStart(2, '0');

	return `${yyyy}/${mm}/${stem}-${randomId}.${extension}`;
}
