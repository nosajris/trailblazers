import { error } from '@sveltejs/kit';
import { verifyPagePreviewToken } from '@trailblazers/core';
import { services } from '$lib/server/services';
import { cacheHeaders } from '$lib/server/cache';
import type { PageServerLoad } from './$types';

/**
 * A draft page, viewable before it is published, by someone who is not signed
 * into the staff portal.
 *
 * Why it exists: editing a section autosaves into a draft, so there was no way
 * to see a change before visitors did without publishing it first. The person
 * who needs to approve the wording — a pastor, on their phone — does not have a
 * portal account and should not need one to read a paragraph.
 *
 * The link's authority is the signed token, which names this page and expires
 * (`modules/pages/publishing.ts`). An unsigned, wrong, or expired token gets
 * the same 404 as a page that does not exist: a preview URL should not confirm
 * that there is a draft there.
 *
 * `private, no-store` and `noindex` because this is unpublished content. It must
 * never enter the CDN cache, where it would be served to people without a
 * token — the one cache profile that would be a real mistake here.
 */
export const load: PageServerLoad = async ({ params, url, setHeaders }) => {
	const pageId = Number(params.pageId);
	if (!Number.isInteger(pageId) || pageId <= 0) error(404, 'Not found.');

	const secret = process.env.SECRET_KEY;
	if (!secret) error(404, 'Not found.');

	if (!verifyPagePreviewToken(secret, pageId, url.searchParams.get('t'))) {
		error(404, 'That preview link is not valid, or it has expired.');
	}

	setHeaders(cacheHeaders('private'));

	const [settings, draft] = await Promise.all([
		services.settings.getBundle(),
		services.pages.composeDraftPage(pageId)
	]);

	if (!draft) error(404, 'Not found.');

	return { settings, page: draft.page, blocks: draft.blocks };
};
