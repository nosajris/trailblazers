/** A generous size for a phone photo before it gets resized down — not a quality target. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type MediaValidationError = { message: string };

/** Checked before the file ever reaches sharp, so a bad upload fails cheaply. */
export function validateUpload(file: {
	mimeType: string;
	size: number;
}): MediaValidationError | null {
	if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.mimeType)) {
		return { message: 'That file is not a supported image type (JPEG, PNG or WebP).' };
	}
	if (file.size <= 0) {
		return { message: 'That file is empty.' };
	}
	if (file.size > MAX_UPLOAD_BYTES) {
		return {
			message: `That image is larger than ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB.`
		};
	}
	return null;
}
