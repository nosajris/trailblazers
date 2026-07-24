import bcrypt from 'bcryptjs';
import { db } from './db';
import {
	bepProfiles,
	blogs,
	equipment,
	events,
	faqs,
	groups,
	leaders,
	newcomerContent,
	pageSections,
	pages,
	parentContent,
	serveContent,
	siteSettings,
	sermons,
	testimonials,
	users,
	inquiries
} from '@trailblazers/core';

import {
	eventsData,
	blogsData,
	groupsData,
	bepData,
	equipmentData,
	testimonialsData,
	leadersData,
	faqsData
} from './data';

const hash = (pw: string) => bcrypt.hashSync(pw, 10);

async function main() {
	console.log('Starting seed...');

	await db.delete(pageSections);
	await db.delete(pages);
	await db.delete(siteSettings);
	await db.delete(sermons);
	await db.delete(bepProfiles);
	await db.delete(blogs);
	await db.delete(inquiries);
	await db.delete(equipment);
	await db.delete(events);
	await db.delete(groups);
	await db.delete(testimonials);
	await db.delete(leaders);
	await db.delete(faqs);
	await db.delete(serveContent);
	await db.delete(newcomerContent);
	await db.delete(parentContent);
	await db.delete(users);

	console.log('Cleared existing data.');

	const insertedUsers = await db
		.insert(users)
		.values([
			{ email: 'admin@paoz.org', passwordHash: hash('secret'), fullName: 'Admin User', role: 'ADMIN' },
			{
				email: 'secretary@paoz.org',
				passwordHash: hash('secret'),
				fullName: 'CMS Secretary',
				role: 'SECRETARY'
			},
			{ email: 'leader@paoz.org', passwordHash: hash('secret'), fullName: 'Sarah Leader', role: 'LEADER' },
			{ email: 'member@paoz.org', passwordHash: hash('secret'), fullName: 'John Member', role: 'MEMBER' }
		])
		.returning();

	await db.insert(sermons).values([
		{
			title: 'Faith That Moves With Your Week',
			slug: 'faith-that-moves-with-your-week',
			speaker: 'Pastor Tafadzwa',
			youtubeId: 'dQw4w9WgXcQ',
			scripture: 'Hebrews 11:1-6',
			summary: 'Discover how daily faith empowers young adults to lead in university, business, and community.',
			discussionGuide: '1. What step of faith is God calling you to take this week?\n2. How can our small group support your leadership journey?',
			isFeatured: true,
			publishedAt: new Date()
		},
		{
			title: 'The Blueprint for Purposeful Leadership',
			slug: 'blueprint-for-purposeful-leadership',
			speaker: 'Guest Speaker Pastor Sarah',
			youtubeId: 'dQw4w9WgXcQ',
			scripture: 'Proverbs 3:5-6',
			summary: 'Understanding your divine identity and leading with integrity in modern culture.',
			discussionGuide: '1. How do you maintain Christian principles in competitive environments?\n2. Share one goal for your personal spiritual growth.',
			isFeatured: false,
			publishedAt: new Date(Date.now() - 86400000 * 7)
		}
	]);


	console.log(`Inserted ${insertedUsers.length} users.`);

	const eventsToInsert = eventsData.map(({ id: _id, ...rest }) => rest);
	await db.insert(events).values(eventsToInsert);
	console.log(`Inserted ${eventsData.length} events.`);

	const blogsToInsert = blogsData.map((blog, index) => {
		const author = insertedUsers[index % insertedUsers.length];
		const { id: _id, ...rest } = blog;
		return { ...rest, authorId: author!.id };
	});
	await db.insert(blogs).values(blogsToInsert);
	console.log(`Inserted ${blogsData.length} blogs.`);

	const groupsToInsert = groupsData.map(({ id: _id, ...rest }) => rest);
	await db.insert(groups).values(groupsToInsert);
	console.log(`Inserted ${groupsData.length} groups.`);

	const entrepreneurUser =
		insertedUsers.find((u) => u.email === 'entrepreneur@paoz.org') || insertedUsers[0];
	const bepToInsert = bepData.map(({ id: _id, userId: _uid, ...rest }) => ({
		...rest,
		userId: entrepreneurUser!.id
	}));
	await db.insert(bepProfiles).values(bepToInsert);
	console.log(`Inserted ${bepData.length} BEP profiles.`);

	const equipmentToInsert = equipmentData.map(({ id: _id, ...rest }) => rest);
	await db.insert(equipment).values(equipmentToInsert);
	console.log(`Inserted ${equipmentData.length} equipment items.`);

	const testimonialsToInsert = testimonialsData.map(({ id: _id, ...rest }) => rest);
	await db.insert(testimonials).values(testimonialsToInsert);
	const leadersToInsert = leadersData.map(({ id: _id, ...rest }) => rest);
	await db.insert(leaders).values(leadersToInsert);
	const faqsToInsert = faqsData.map(({ id: _id, ...rest }) => rest);
	await db.insert(faqs).values(faqsToInsert);

	await db.insert(serveContent).values({
		headline: 'Serve with us',
		subheadline: 'Your gifts make Sunday possible.',
		body: 'Join a team and build the church alongside friends.',
		ctaLabel: 'Ask about teams',
		ctaHref: '/contact',
		imageUrl: '/images/wallpaper04.jpg',
		status: 'PUBLISHED',
		sortOrder: 0
	});

	await db.insert(newcomerContent).values({
		headline: "I'm new here",
		subheadline: 'Start your journey with Trailblazers.',
		body: 'We saved a seat for you. Plan a visit and meet the team.',
		ctaLabel: 'Plan a visit',
		ctaHref: '/plan-a-visit',
		imageUrl: '/images/slider03.jpeg',
		status: 'PUBLISHED',
		sortOrder: 0
	});

	await db.insert(parentContent).values({
		headline: 'For parents',
		subheadline: 'What we believe about the next generation.',
		body: 'Safety, community, and discipleship matter here.',
		ctaLabel: 'Talk to us',
		ctaHref: '/contact',
		imageUrl: '/images/image01.jpeg',
		status: 'PUBLISHED',
		sortOrder: 0
	});

	const [home] = await db
		.insert(pages)
		.values({ slug: '/', title: 'Home', status: 'PUBLISHED' })
		.returning();

	const heroConfig = {
		title: 'Ignited for impact',
		subtitle: 'A transformational leadership ecosystem for young adults.',
		imageUrl: '/images/wallpaper01.jpg',
		videoUrl: '',
		primaryCtaLabel: 'Plan a visit',
		primaryCtaHref: '/plan-a-visit',
		secondaryCtaLabel: 'Browse events',
		secondaryCtaHref: '/events'
	};

	await db.insert(pageSections).values([
		{ pageId: home!.id, sectionType: 'HERO', sortOrder: 0, status: 'PUBLISHED', config: heroConfig },
		{
			pageId: home!.id,
			sectionType: 'EVENTS_RAIL',
			sortOrder: 1,
			status: 'PUBLISHED',
			config: { title: 'Upcoming events', limit: 3 }
		},
		{
			pageId: home!.id,
			sectionType: 'BLOG',
			sortOrder: 2,
			status: 'PUBLISHED',
			config: { title: 'Stories & updates', limit: 3 }
		},
		{
			pageId: home!.id,
			sectionType: 'TESTIMONIALS',
			sortOrder: 3,
			status: 'PUBLISHED',
			config: { title: 'What people are saying' }
		},
		{
			pageId: home!.id,
			sectionType: 'GROUPS',
			sortOrder: 4,
			status: 'PUBLISHED',
			config: { title: 'Connect in community' }
		},
		{ pageId: home!.id, sectionType: 'SERVE', sortOrder: 5, status: 'PUBLISHED', config: {} },
		{ pageId: home!.id, sectionType: 'LEADERS', sortOrder: 6, status: 'PUBLISHED', config: { title: 'Leadership' } },
		{ pageId: home!.id, sectionType: 'IM_NEW', sortOrder: 7, status: 'PUBLISHED', config: {} },
		{ pageId: home!.id, sectionType: 'PARENTS', sortOrder: 8, status: 'PUBLISHED', config: {} },
		{
			pageId: home!.id,
			sectionType: 'FAQ',
			sortOrder: 9,
			status: 'PUBLISHED',
			config: { title: 'Questions' }
		},
		{
			pageId: home!.id,
			sectionType: 'CONTACT',
			sortOrder: 10,
			status: 'PUBLISHED',
			config: { title: 'We would love to hear from you', intro: 'Send us a note.' }
		}
	]);

	await db.insert(siteSettings).values([
		{
			key: 'nav_links',
			value: [
				{ label: 'Home', href: '/' },
				{
					label: 'Watch & listen',
					columns: [
						{
							title: 'Media',
							links: [
								{ label: 'Watch', href: '/watch' },
								{ label: 'Messages', href: '/messages' },
								{ label: 'Events', href: '/events' }
							]
						},
						{
							title: 'Connect',
							links: [
								{ label: 'Plan a visit', href: '/plan-a-visit' },
								{ label: 'Contact', href: '/contact' }
							]
						}
					]
				},
				{ label: 'Stories', href: '/stories' },
				{ label: 'Groups', href: '/groups' },
				{
					label: 'Ministries',
					columns: [
						{
							title: 'Grow & serve',
							links: [
								{ label: 'BEP Hub', href: '/bep-hub' },
								{ label: 'Serve', href: '/serve' }
							]
						},
						{
							title: 'Learn',
							links: [{ label: 'FAQ', href: '/faq' }]
						}
					]
				},
				{ label: 'Give', href: '/give' }
			]
		},
		{
			key: 'footer_columns',
			value: [
				{
					title: 'Ministry',
					links: [
						{ label: 'Watch', href: '/watch' },
						{ label: 'Messages', href: '/messages' },
						{ label: 'Events', href: '/events' },
						{ label: 'Plan a visit', href: '/plan-a-visit' }
					]
				},
				{
					title: 'Community',
					links: [
						{ label: 'Stories', href: '/stories' },
						{ label: 'Groups', href: '/groups' },
						{ label: 'BEP Hub', href: '/bep-hub' },
						{ label: 'Serve', href: '/serve' }
					]
				},
				{
					title: 'Connect',
					links: [
						{ label: 'FAQ', href: '/faq' },
						{ label: 'Contact', href: '/contact' },
						{ label: 'Give', href: '/give' }
					]
				}
			]
		},
		{
			key: 'seo_defaults',
			value: {
				title: 'Trailblazers Young Adults',
				description: 'Young adults ministry — events, community, and growth.'
			}
		},
		{
			key: 'site_extras',
			value: {
				givingUrl: '',
				watchUrl: '/watch',
				watchEmbedUrl: '',
				messagesUrl: '/messages',
				planVisitHref: '/plan-a-visit',
				campuses: [{ id: 'main', label: 'Gather with us', href: '/contact' }],
				languageOptions: [
					{ code: 'en', label: 'English', href: '#' },
					{ code: 'es', label: 'Español', href: '#' }
				],
				organizationName: 'Trailblazers Young Adults'
			}
		}
	]);

	console.log('Seed completed successfully.');
	process.exit(0);
}

main().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
