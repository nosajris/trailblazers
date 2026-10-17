import { json } from '@sveltejs/kit';
import { services } from '$lib/server/services';
import { consumeFormSubmission } from '$lib/server/rate-limit';
import type { RequestHandler } from './$types';

/**
 * Counts one click on a tracked link (Give, Watch Live) for the analytics
 * report. Fire-and-forget from the client — see `packages/ui/src/site/
 * track-click.ts` — so a slow or failed call here never blocks the
 * navigation the visitor actually wanted. No visitor identity is recorded,
 * only a running count per link (see `@trailblazers/core`'s analytics
 * module), so this needs no auth; it reuses the same per-IP throttle as the
 * public forms to keep it from being spammed into meaningless numbers.
 */
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const throttle = consumeFormSubmission(getClientAddress(), 'track-click');
	if (!throttle.allowed) return json({ ok: false }, { status: 429 });

	const body = await request.json().catch(() => null);
	const href = typeof body?.href === 'string' ? body.href.slice(0, 300) : '';
	const label = typeof body?.label === 'string' ? body.label.slice(0, 140) : '';
	if (!href) return json({ ok: false }, { status: 400 });

	await services.analytics.recordClick(href, label).catch(() => undefined);
	return json({ ok: true });
};
