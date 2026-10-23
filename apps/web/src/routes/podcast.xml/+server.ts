import { services } from '$lib/server/services';
import type { RequestHandler } from './$types';

/**
 * Podcast RSS 2.0 feed (with the `itunes` namespace most podcast apps read)
 * for every sermon that has its own audio file. A sermon with only a
 * `videoUrl`/`youtubeId` is a message to watch, not a podcast episode, so it
 * is left out here rather than listed with nothing to actually play.
 *
 * Kept deliberately simple: no episode artwork beyond the feed-level image,
 * no explicit byte `length` on the enclosure (`0` is the documented
 * "unknown" value — Apple's own validator accepts it, and computing the real
 * size would mean fetching every audio file on every request).
 */

/** XML has five characters that must be escaped inside element text. */
function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function guessAudioType(url: string): string {
	const lower = url.toLowerCase();
	if (lower.endsWith('.m4a')) return 'audio/mp4';
	if (lower.endsWith('.wav')) return 'audio/wav';
	if (lower.endsWith('.ogg')) return 'audio/ogg';
	return 'audio/mpeg';
}

export const GET: RequestHandler = async ({ url }) => {
	const origin = url.origin;

	const [sermons, settings] = await Promise.all([
		services.sermons.getAllSermons(),
		services.settings.getBundle()
	]);

	const episodes = sermons
		.filter((sermon) => Boolean(sermon.audioUrl))
		.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
		.slice(0, 200);

	const title = settings.seoDefaults.title || 'Trailblazers';
	const description = settings.seoDefaults.description || 'Messages from Trailblazers.';
	const feedImage = episodes.find((e) => e.thumbnailUrl)?.thumbnailUrl;

	const items = episodes
		.map((sermon) => {
			const link = `${origin}/watch/${sermon.slug}`;
			const pubDate = new Date(sermon.publishedAt).toUTCString();
			const audioUrl = sermon.audioUrl as string;
			const summary = sermon.summary ?? sermon.scripture ?? '';

			return (
				`<item>` +
				`<title>${escapeXml(sermon.title)}</title>` +
				`<link>${escapeXml(link)}</link>` +
				`<guid isPermaLink="false">${escapeXml(`sermon-${sermon.id}`)}</guid>` +
				`<pubDate>${pubDate}</pubDate>` +
				(summary ? `<description>${escapeXml(summary)}</description>` : '') +
				`<itunes:author>${escapeXml(sermon.speaker)}</itunes:author>` +
				`<itunes:explicit>false</itunes:explicit>` +
				`<enclosure url="${escapeXml(audioUrl)}" length="0" type="${guessAudioType(audioUrl)}" />` +
				`</item>`
			);
		})
		.join('\n');

	const body =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
		`<channel>` +
		`<title>${escapeXml(title)} — Messages</title>` +
		`<link>${escapeXml(origin)}/watch</link>` +
		`<atom:link href="${escapeXml(origin)}/podcast.xml" rel="self" type="application/rss+xml" />` +
		`<description>${escapeXml(description)}</description>` +
		`<language>en-us</language>` +
		`<itunes:author>${escapeXml(title)}</itunes:author>` +
		`<itunes:explicit>false</itunes:explicit>` +
		(feedImage
			? `<itunes:image href="${escapeXml(feedImage)}" /><image><url>${escapeXml(feedImage)}</url><title>${escapeXml(title)}</title><link>${escapeXml(origin)}/watch</link></image>`
			: '') +
		items +
		`</channel>` +
		`</rss>`;

	return new Response(body, {
		headers: {
			'content-type': 'application/rss+xml; charset=utf-8',
			'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
		}
	});
};
