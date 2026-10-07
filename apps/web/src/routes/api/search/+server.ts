import { json } from '@sveltejs/kit';
import { searchItems, type SearchItem } from '@trailblazers/ui/site/search';
import { services } from '$lib/server/services';
import { cacheHeaders } from '$lib/server/cache';
import type { RequestHandler } from './$types';

/**
 * Site search.
 *
 * The search overlay used to offer four fixed links, so anyone looking for a
 * named group, camp or message had to know which page it lived on. Ranking
 * happens in `@trailblazers/ui/site/search`, which is unit tested; this route
 * only gathers the records.
 */
const MAX_QUERY = 80;
const LIMIT = 8;

/** Pages worth reaching by name even though they are in the navigation. */
const PAGES: SearchItem[] = [
	{ id: 'page-visit', kind: 'page', title: 'Plan a visit', href: '/plan-a-visit', keywords: 'new first time visit times address' },
	{ id: 'page-watch', kind: 'page', title: 'Watch', href: '/watch', keywords: 'live stream sermon video' },
	{ id: 'page-messages', kind: 'page', title: 'Messages', href: '/messages', keywords: 'sermons teaching series' },
	{ id: 'page-events', kind: 'page', title: 'Events', href: '/events', keywords: 'camp workshop meetup calendar' },
	{ id: 'page-groups', kind: 'page', title: 'Groups', href: '/groups', keywords: 'connect group campus hub' },
	{ id: 'page-serve', kind: 'page', title: 'Serve', href: '/serve', keywords: 'volunteer team join' },
	{ id: 'page-give', kind: 'page', title: 'Give', href: '/give', keywords: 'giving offering tithe donate' },
	{ id: 'page-stories', kind: 'page', title: 'Stories', href: '/stories', keywords: 'blog news testimony' },
	{ id: 'page-prayer', kind: 'page', title: 'Prayer', href: '/prayer', keywords: 'pray request' },
	{ id: 'page-faq', kind: 'page', title: 'FAQ', href: '/faq', keywords: 'questions help' },
	{ id: 'page-contact', kind: 'page', title: 'Contact', href: '/contact', keywords: 'email phone reach us' }
];

const when = (date: Date | string): string =>
	new Intl.DateTimeFormat('en-GB', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		timeZone: 'Africa/Harare'
	}).format(new Date(date));

export const GET: RequestHandler = async ({ url, setHeaders }) => {
	setHeaders(cacheHeaders('dynamic'));

	const query = (url.searchParams.get('q') ?? '').slice(0, MAX_QUERY);
	if (query.trim().length === 0) return json({ results: [] });

	const [events, groups, sermons, settings] = await Promise.all([
		services.events.listUpcomingForHome(50),
		services.groups.listPublished(),
		services.sermons.getAllSermons(),
		services.settings.getBundle()
	]);

	const items: SearchItem[] = [
		...PAGES,
		...(settings.siteExtras.campuses ?? []).map((campus) => ({
			id: `campus-${campus.id}`,
			kind: 'page' as const,
			title: campus.label,
			subtitle: 'Campus',
			href: `/campus/${campus.id}`,
			keywords: `campus location ${campus.address ?? ''} ${(campus.times ?? []).join(' ')}`
		})),
		...events.map((event) => ({
			id: `event-${event.id}`,
			kind: 'event' as const,
			title: event.title,
			subtitle: `${when(event.date)} · ${event.location}`,
			href: `/events/${event.id}`,
			keywords: `${event.type} ${event.location}`
		})),
		...groups.map((group) => ({
			id: `group-${group.id}`,
			kind: 'group' as const,
			title: group.name,
			subtitle: `${group.dayTime} · Led by ${group.leader}`,
			href: `/groups#group-${group.id}`,
			keywords: `${group.type} ${group.leader}`
		})),
		...sermons.map((sermon) => ({
			id: `sermon-${sermon.id}`,
			kind: 'sermon' as const,
			title: sermon.title,
			subtitle: sermon.speaker,
			href: '/watch',
			keywords: `${sermon.speaker} ${sermon.scripture ?? ''} ${sermon.summary ?? ''}`
		}))
	];

	return json({ results: searchItems(items, query, LIMIT) });
};
