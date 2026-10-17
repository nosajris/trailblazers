/**
 * The pure resize arithmetic, split out from service.ts so it is testable
 * without sharp, a buffer, or a network call.
 */

/** No uploaded photo needs to be wider or taller than this on the public site. */
export const MAX_LONG_EDGE = 1600;

/** The smaller webp copies generated alongside the full-size one, for srcset. */
export const VARIANT_WIDTHS = [480, 960] as const;

/**
 * Where the long edge of `width`×`height` lands after capping it to
 * `maxLongEdge`, preserving aspect ratio. `resize` is false when the image
 * is already within bounds — sharp still runs with `withoutEnlargement`,
 * but callers that want to skip the pass entirely can check this first.
 */
export function clampToLongEdge(
	width: number,
	height: number,
	maxLongEdge: number = MAX_LONG_EDGE
): { width: number; height: number; resize: boolean } {
	if (width <= 0 || height <= 0) return { width, height, resize: false };

	const longEdge = Math.max(width, height);
	if (longEdge <= maxLongEdge) return { width, height, resize: false };

	const scale = maxLongEdge / longEdge;
	return {
		width: Math.round(width * scale),
		height: Math.round(height * scale),
		resize: true
	};
}

/** Which of the standard variant widths are worth generating for an image this wide. */
export function variantWidthsFor(fullWidth: number): number[] {
	return VARIANT_WIDTHS.filter((w) => w < fullWidth);
}
