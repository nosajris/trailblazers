import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { db } from './db';
import {
	auditLogs,
	bepProfiles,
	blogs,
	equipment,
	events,
	faqs,
	groups,
	inquiries,
	leaders,
	newcomerContent,
	pageSections,
	pages,
	parentContent,
	serveContent,
	sermons,
	sermonSeries,
	sessions,
	siteSettings,
	statistics,
	tasks,
	testimonials,
	users
} from '@trailblazers/core';

import {
	auditLogsData,
	bepData,
	blogsData,
	equipmentData,
	eventsData,
	faqsData,
	groupsData,
	inquiriesData,
	leadersData,
	newcomerContentData,
	pagesData,
	parentContentData,
	serveContentData,
	sermonsData,
	sermonSeriesData,
	siteSettingsExtraData,
	statisticsData,
	tasksData,
	testimonialsData,
	usersData
} from './data';

const hash = (pw: string) => bcrypt.hashSync(pw, 10);

async function main() {
	console.log('Starting seed...\n');

	// Delete in FK-safe order (children before parents).
	await db.delete(auditLogs);
	await db.delete(tasks);
	await db.delete(statistics);
	await db.delete(inquiries);
	await db.delete(pageSections);
	await db.delete(pages);
	await db.delete(siteSettings);
	await db.delete(sermons);
	await db.delete(sermonSeries);
	await db.delete(bepProfiles);
	await db.delete(blogs);
	await db.delete(equipment);
	await db.delete(events);
	await db.delete(groups);
	await db.delete(testimonials);
	await db.delete(leaders);
	await db.delete(faqs);
	await db.delete(serveContent);
	await db.delete(newcomerContent);
	await db.delete(parentContent);
	await db.delete(sessions);
	await db.delete(users);

	console.log('Cleared existing data.\n');

	// ---------------------------------------------------------------------
	// Users (10) — everything else with a userId FK is seeded relative to these.
	// ---------------------------------------------------------------------
	const insertedUsers = await db
		.insert(users)
		.values(
			usersData.map((u) => ({
				email: u.email,
				passwordHash: hash(u.password),
				fullName: u.fullName,
				role: u.role
			}))
		)
		.returning();
	console.log(`Inserted ${insertedUsers.length} users.`);

	// Sessions (10) — one live demo session per user, 30 days out.
	const thirtyDaysFromNow = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
	await db.insert(sessions).values(
		insertedUsers.map((u) => ({
			id: crypto.randomUUID(),
			userId: u.id,
			expiresAt: thirtyDaysFromNow
		}))
	);
	console.log(`Inserted ${insertedUsers.length} sessions.`);

	// ---------------------------------------------------------------------
	// Sermon series (10) -> sermons (10, referencing a series + published date offsets)
	// ---------------------------------------------------------------------
	const insertedSeries = await db.insert(sermonSeries).values(
		sermonSeriesData.map((s) => ({
			title: s.title,
			slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
			description: s.description,
			coverImageUrl: s.coverImageUrl
		}))
	).returning();
	console.log(`Inserted ${insertedSeries.length} sermon series.`);

	await db.insert(sermons).values(
		sermonsData.map((s) => ({
			title: s.title,
			slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
			speaker: s.speaker,
			seriesId: insertedSeries[s.seriesIndex % insertedSeries.length]!.id,
			youtubeId: s.youtubeId,
			scripture: s.scripture,
			summary: s.summary,
			discussionGuide: s.discussionGuide,
			isFeatured: s.isFeatured,
			publishedAt: new Date(Date.now() - s.daysAgo * 86400000)
		}))
	);
	console.log(`Inserted ${sermonsData.length} sermons.`);

	// ---------------------------------------------------------------------
	// Events, blogs, groups
	// ---------------------------------------------------------------------
	const eventsToInsert = eventsData.map(({ id: _id, ...rest }) => rest);
	await db.insert(events).values(eventsToInsert);
	console.log(`Inserted ${eventsData.length} events.`);

	const blogsToInsert = blogsData.map((blog, index) => {
		const author = insertedUsers[index % insertedUsers.length];
		const { id: _id, ...rest } = blog;
		return { ...rest, authorId: author!.id, publishedAt: new Date(Date.now() - index * 86400000) };
	});
	await db.insert(blogs).values(blogsToInsert);
	console.log(`Inserted ${blogsData.length} blogs.`);

	const groupsToInsert = groupsData.map(({ id: _id, ...rest }) => rest);
	await db.insert(groups).values(groupsToInsert);
	console.log(`Inserted ${groupsData.length} groups.`);

	// ---------------------------------------------------------------------
	// BEP profiles + equipment
	// ---------------------------------------------------------------------
	const bepToInsert = bepData.map(({ id: _id, userId, ...rest }) => ({
		...rest,
		userId: insertedUsers[(userId - 1) % insertedUsers.length]!.id
	}));
	await db.insert(bepProfiles).values(bepToInsert);
	console.log(`Inserted ${bepData.length} BEP profiles.`);

	const equipmentToInsert = equipmentData.map(({ id: _id, ...rest }) => rest);
	await db.insert(equipment).values(equipmentToInsert);
	console.log(`Inserted ${equipmentData.length} equipment items.`);

	// ---------------------------------------------------------------------
	// Testimonials, leaders, faqs
	// ---------------------------------------------------------------------
	const testimonialsToInsert = testimonialsData.map(({ id: _id, ...rest }) => rest);
	await db.insert(testimonials).values(testimonialsToInsert);
	console.log(`Inserted ${testimonialsData.length} testimonials.`);

	const leadersToInsert = leadersData.map(({ id: _id, ...rest }) => rest);
	await db.insert(leaders).values(leadersToInsert);
	console.log(`Inserted ${leadersData.length} leaders.`);

	const faqsToInsert = faqsData.map(({ id: _id, ...rest }) => rest);
	await db.insert(faqs).values(faqsToInsert);
	console.log(`Inserted ${faqsData.length} FAQs.`);

	// ---------------------------------------------------------------------
	// Rich content blocks (serve / newcomer / parent) — 10 rows each, only the
	// first (sortOrder 0, status PUBLISHED) is shown on the live site today.
	// ---------------------------------------------------------------------
	await db.insert(serveContent).values(serveContentData);
	console.log(`Inserted ${serveContentData.length} serve_content rows.`);

	await db.insert(newcomerContent).values(newcomerContentData);
	console.log(`Inserted ${newcomerContentData.length} newcomer_content rows.`);

	await db.insert(parentContent).values(parentContentData);
	console.log(`Inserted ${parentContentData.length} parent_content rows.`);

	// ---------------------------------------------------------------------
	// Pages + page sections (10 pages; home page drives the live public site)
	// ---------------------------------------------------------------------
	let totalSections = 0;
	for (const page of pagesData) {
		const [inserted] = await db.insert(pages).values({ slug: page.slug, title: page.title, status: 'PUBLISHED' }).returning();
		await db.insert(pageSections).values(
			page.sections.map((s) => ({
				pageId: inserted!.id,
				sectionType: s.sectionType as (typeof pageSections.$inferInsert)['sectionType'],
				sortOrder: s.sortOrder,
				status: 'PUBLISHED',
				config: s.config
			}))
		);
		totalSections += page.sections.length;
	}
	console.log(`Inserted ${pagesData.length} pages and ${totalSections} page_sections.`);

	// ---------------------------------------------------------------------
	// Site settings — 4 core keys the app reads today + 6 extra rows modelling
	// features found while auditing elevationchurch.org (giving, service times, etc.)
	// ---------------------------------------------------------------------
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
				campuses: [
					{ id: 'harare', label: 'Harare — Resurrection Center', href: '/plan-a-visit' },
					{ id: 'bulawayo', label: 'Bulawayo — NUST Hub', href: '/plan-a-visit' },
					{ id: 'gweru', label: 'Gweru — MSU Ignite', href: '/plan-a-visit' },
					{ id: 'online', label: 'Online — Diaspora Connect', href: '/watch' }
				],
				languageOptions: [
					{ code: 'en', label: 'English', href: '#' },
					{ code: 'es', label: 'Español', href: '#' }
				],
				organizationName: 'Trailblazers Young Adults'
			}
		},
		...siteSettingsExtraData
	]);
	console.log(`Inserted ${4 + siteSettingsExtraData.length} site_settings rows.`);

	// ---------------------------------------------------------------------
	// Inquiries, statistics, tasks, audit logs
	// ---------------------------------------------------------------------
	await db.insert(inquiries).values(inquiriesData);
	console.log(`Inserted ${inquiriesData.length} inquiries.`);

	await db.insert(statistics).values(
		statisticsData.map((s, index) => ({
			districtName: s.districtName,
			date: new Date(Date.now() - s.daysAgo * 86400000).toISOString().slice(0, 10),
			attendanceCount: s.attendanceCount,
			salvationsCount: s.salvationsCount,
			notes: s.notes,
			submittedBy: insertedUsers[index % insertedUsers.length]!.id
		}))
	);
	console.log(`Inserted ${statisticsData.length} statistics rows.`);

	await db.insert(tasks).values(
		tasksData.map((t, index) => ({
			title: t.title,
			description: t.description,
			assignedToUserId: insertedUsers[index % insertedUsers.length]!.id,
			relatedEntityType: t.relatedEntityType,
			relatedEntityId: t.relatedEntityId,
			isCompleted: index % 4 === 0,
			dueDate: new Date(Date.now() + t.daysDue * 86400000)
		}))
	);
	console.log(`Inserted ${tasksData.length} tasks.`);

	await db.insert(auditLogs).values(
		auditLogsData.map((a, index) => {
			const actor = insertedUsers[index % insertedUsers.length]!;
			return {
				userId: actor.id,
				userName: actor.fullName,
				action: a.action,
				entityType: a.entityType,
				entityId: a.entityId,
				details: a.details,
				createdAt: new Date(Date.now() - index * 3600000)
			};
		})
	);
	console.log(`Inserted ${auditLogsData.length} audit_logs rows.`);

	console.log('\nSeed completed successfully — every table has at least 10 rows.');
	process.exit(0);
}

main().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
