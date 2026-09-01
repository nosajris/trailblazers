import { services } from '$lib/server/services';
import type { RequestHandler } from './$types';

/**
 * XML sitemap.
 *
 * Fixes three things the previous version got wrong:
 *  - every sermon emitted `<loc>/watch</loc>`, so the file contained dozens of
 *    duplicate URLs, which search engines treat as a quality signal against the
 *    site rather than as extra pages;
 *  - `/contact`, `/faq` and `/messages` were missing entirely;
 *  - no `<lastmod>`, so crawlers had nothing to prioritise on.
 */

type SitemapEntry = {
	path: string;
	changefreq: 'daily' | 'weekly' | 'monthly';
	priority: string;
	lastmod?: Date | null;
};

/** XML has five characters that must be escaped inside element text. */
function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function toEntry(origin: string, entry: SitemapEntry): string {
	const lastmod = entry.lastmod
		? `<lastmod>${entry.lastmod.toISOString().split('T')[0]}</lastmod>`
		: '';

	return (
		`<url><loc>${escapeXml(origin + entry.path)}</loc>` +
		lastmod +
		`<changefreq>${entry.changefreq}</changefreq>` +
		`<priority>${entry.priority}</priority></url>`
	);
}

export const GET: RequestHandler = async ({ url, setHeaders }) => {
	const origin = url.origin;

	const [sermons, events, posts] = await Promise.all([
		services.sermons.getAllSermons(),
		services.events.listUpcomingForHome(50),
		services.blog.listPublished(100)
	]);

	const staticPages: SitemapEntry[] = [
		{ path: '', changefreq: 'weekly', priority: '1.0' },
		{ path: '/watch', changefreq: 'weekly', priority: '0.9' },
		{ path: '/events', changefreq: 'daily', priority: '0.9' },
		{ path: '/plan-a-visit', changefreq: 'monthly', priority: '0.8' },
		{ path: '/groups', changefreq: 'weekly', priority: '0.8' },
		{ path: '/serve', changefreq: 'monthly', priority: '0.7' },
		{ path: '/stories', changefreq: 'weekly', priority: '0.7' },
		{ path: '/bep-hub', changefreq: 'weekly', priority: '0.7' },
		{ path: '/give', changefreq: 'monthly', priority: '0.7' },
		// Previously absent from the sitemap despite being real, indexable pages.
		{ path: '/prayer', changefreq: 'monthly', priority: '0.7' },
		{ path: '/contact', changefreq: 'monthly', priority: '0.6' },
		{ path: '/faq', changefreq: 'monthly', priority: '0.6' },
		{ path: '/messages', changefreq: 'weekly', priority: '0.6' }
	];

	// One entry per event and per story. Sermons have no page of their own, so
	// they contribute their most recent publish date to /watch rather than
	// repeating that URL once per sermon.
	const latestSermonDate = sermons.reduce<Date | null>((latest, sermon) => {
		const published = sermon.publishedAt ? new Date(sermon.publishedAt) : null;
		if (!published) return latest;
		return !latest || published > latest ? published : latest;
	}, null);

	const entries: SitemapEntry[] = [
		...staticPages.map((page) =>
			page.path === '/watch' ? { ...page, lastmod: latestSermonDate } : page
		),
		...events.map((event) => ({
			path: `/events/${event.id}`,
			changefreq: 'daily' as const,
			priority: '0.8',
			lastmod: null
		})),
		...posts.map((post) => ({
			path: `/stories/${post.id}`,
			changefreq: 'monthly' as const,
			priority: '0.6',
			lastmod: null
		}))
	];

	const body =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
		entries.map((entry) => toEntry(origin, entry)).join('\n') +
		`\n</urlset>`;

	setHeaders({
		'content-type': 'application/xml',
		'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
	});

	return new Response(body);
};
