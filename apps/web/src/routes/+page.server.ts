import { services } from '$lib/server/services';
import type { HomeSectionBlock } from '@trailblazers/core';

function buildFallbackBlocks(): HomeSectionBlock[] {
	return [
		{
			kind: 'HERO',
			data: {
				title: 'WELCOME HOME',
				subtitle:
					'A transformational leadership ecosystem for young adults — faith, community, and purpose.',
				imageUrl: '/images/wallpaper01.jpg',
				primaryCta: { label: 'Plan a visit', href: '/plan-a-visit' },
				secondaryCta: { label: 'Watch Latest Message', href: '/watch' }
			}
		}
	];
}

export const load = async () => {
	const settings = await services.settings.getBundle();
	let blocks = await services.pages.composePublicPage('/');
	const latestSermon = await services.sermons.getFeaturedSermon();

	if (blocks.length === 0) {
		const [
			events,
			blogs,
			groups,
			testimonials,
			leaders,
			faqs,
			serve,
			newcomer,
			parent
		] = await Promise.all([
			services.events.listUpcomingForHome(3),
			services.blog.listLatest(3),
			services.groups.listPublished(),
			services.testimonials.listPublished(),
			services.leaders.listPublished(),
			services.faq.listPublished(),
			services.serve.getPrimaryPublished(),
			services.newcomers.getPrimaryPublished(),
			services.parents.getPrimaryPublished()
		]);

		const dynamic: HomeSectionBlock[] = [
			...buildFallbackBlocks(),
			{ kind: 'EVENTS_RAIL', data: { title: 'Upcoming events', limit: 3, events } },
			{ kind: 'BLOG', data: { title: 'Stories & updates', posts: blogs } },
			{ kind: 'TESTIMONIALS', data: { title: 'What people are saying', items: testimonials } },
			{ kind: 'GROUPS', data: { title: 'Connect in community', groups } }
		];

		if (serve) dynamic.push({ kind: 'SERVE', data: serve });
		dynamic.push({ kind: 'LEADERS', data: { title: 'Leadership', leaders } });
		if (newcomer) dynamic.push({ kind: 'IM_NEW', data: newcomer });
		if (parent) dynamic.push({ kind: 'PARENTS', data: parent });
		dynamic.push(
			{ kind: 'FAQ', data: { title: 'Questions', items: faqs } },
			{ kind: 'CONTACT', data: { title: 'We would love to hear from you', intro: 'Send us a note.' } }
		);

		blocks = dynamic;
	}

	return {
		settings,
		blocks: blocks as HomeSectionBlock[],
		latestSermon
	};
};
