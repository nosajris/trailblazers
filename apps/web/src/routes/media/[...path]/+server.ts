import { error } from '@sveltejs/kit';
import { services } from '$lib/server/services';
import type { RequestHandler } from './$types';

/**
 * Streams a CMS-uploaded image out of the private Blob store.
 *
 * The store is private so its raw `*.private.blob.vercel-storage.com` URL
 * can't be hot-linked or enumerated — not to gate who can view the photo.
 * These are public site images (testimonial/leader/story photos, page
 * section backgrounds, etc.), so this route itself does no auth check; it's
 * the public counterpart to `apps/admin`'s copy of the same route, which
 * serves the same store for the staff media picker and editor previews.
 *
 * `params.path` is the bare Blob pathname stored in `media_assets.url` /
 * every `*.image_url` column (e.g. `cms/<uuid>-960.webp`) — see
 * `packages/core/src/util/public-media-url.ts`, which is what rewrote it to
 * `/media/${pathname}` in the first place.
 */
export const GET: RequestHandler = async ({ params }) => {
	const blob = await services.media.getBlob(params.path);
	if (!blob) throw error(404, 'Not found');

	return new Response(blob.stream, {
		headers: {
			'Content-Type': blob.contentType,
			'X-Content-Type-Options': 'nosniff',
			// Every upload gets a random-UUID key with a width suffix and is
			// never overwritten (see media/service.ts), so the content at a
			// given pathname never changes — safe to cache hard, in the
			// browser and at the CDN.
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
