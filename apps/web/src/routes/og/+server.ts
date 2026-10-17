import { error } from '@sveltejs/kit';
import { logger, ogCardSvg, renderOgCard, verifyOgParams } from '@trailblazers/core';
import { services } from '$lib/server/services';
import type { RequestHandler } from './$types';

/**
 * The branded fallback share image for an event, sermon, or story that has
 * no uploaded photo of its own — see `@trailblazers/core`'s og-image
 * module. `title`/`kicker` and the signature all come from the query
 * string, signed by whichever page's server load built the URL
 * (`ogImageUrl`), so this never draws arbitrary text for anyone who finds
 * the URL pattern.
 */
export const GET: RequestHandler = async ({ url, setHeaders }) => {
	const title = url.searchParams.get('title') ?? '';
	const kicker = url.searchParams.get('kicker') ?? '';
	const sig = url.searchParams.get('sig') ?? '';

	if (!process.env.SECRET_KEY || !verifyOgParams(process.env.SECRET_KEY, { title, kicker }, sig)) {
		throw error(403, 'Invalid or missing signature');
	}

	const settings = await services.settings.getBundle();

	let png: Buffer;
	try {
		png = await renderOgCard(
			ogCardSvg({
				title,
				kicker,
				brand: settings.siteExtras.organizationName,
				bg: 'f95c4b'
			})
		);
	} catch (err) {
		logger.error('OgImage', 'render failed', { message: err instanceof Error ? err.message : String(err) });
		throw error(500, 'Could not render the image');
	}

	// Deterministic per URL (title+kicker+signature never change for the
	// same page), so this can be cached hard and long.
	setHeaders({ 'cache-control': 'public, max-age=31536000, immutable' });

	return new Response(new Uint8Array(png), { headers: { 'content-type': 'image/png' } });
};
