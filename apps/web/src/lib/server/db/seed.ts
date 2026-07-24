// ### FILE: src/lib/server/db/seed.ts ###
import { db } from './index';
import * as schema from './schema';
import { sql } from 'drizzle-orm';

export async function seed() {
	console.log('🌱 Starting Database Seed...');

	// 1. Clean existing data (Optional: remove if you want to append)
	// We delete in reverse order of dependencies to avoid foreign key constraint errors
	console.log('🧹 Cleaning old data...');
	await db.delete(schema.inquiries);
	await db.delete(schema.statistics);
	await db.delete(schema.equipment);
	await db.delete(schema.bepProfiles);
	await db.delete(schema.faqs);
	await db.delete(schema.leaders);
	await db.delete(schema.testimonials);
	await db.delete(schema.groups);
	await db.delete(schema.blogs);
	await db.delete(schema.events);
	await db.delete(schema.users);

	// 2. Seed Users (Critical for Foreign Keys)
	console.log('👤 Seeding Users...');
	const userInputs = [
		{ email: 'admin@paoz.org', fullName: 'Tinashe Admin', role: 'ADMIN' as const },
		{ email: 'leader1@paoz.org', fullName: 'Pastor John', role: 'LEADER' as const },
		{ email: 'leader2@paoz.org', fullName: 'Sarah Moyo', role: 'LEADER' as const },
		{ email: 'member1@gmail.com', fullName: 'Rudo Chidema', role: 'MEMBER' as const },
		{ email: 'member2@gmail.com', fullName: 'Farai Gumbo', role: 'MEMBER' as const },
		{ email: 'member3@gmail.com', fullName: 'Tatenda Zulu', role: 'MEMBER' as const },
		{ email: 'member4@gmail.com', fullName: 'Blessing Nkosi', role: 'MEMBER' as const },
		{ email: 'member5@gmail.com', fullName: 'Ngoni Phiri', role: 'MEMBER' as const },
		{ email: 'member6@gmail.com', fullName: 'Chipo Mhene', role: 'MEMBER' as const },
		{ email: 'member7@gmail.com', fullName: 'Tendai Sithole', role: 'MEMBER' as const },
	];

	const createdUsers = await db.insert(schema.users).values(
		userInputs.map(u => ({
			email: u.email,
			fullName: u.fullName,
			role: u.role,
			passwordHash: 'hashed_placeholder_123', // In real app, use Argon2
			avatarUrl: `https://ui-avatars.com/api/?name=${u.fullName.replace(' ', '+')}`,
		}))
	).returning({ id: schema.users.id });

	const userIds = createdUsers.map(u => u.id);

	// 3. Seed Events
	console.log('📅 Seeding Events...');
	await db.insert(schema.events).values([
		{
			title: 'National Youth Camp 2026',
			description: 'The annual gathering of Trailblazers from all provinces. 3 days of power.',
			date: new Date('2026-08-15T10:00:00'),
			location: 'Marondera Resort',
			type: 'CAMP' as const,
			price: 15000, // $150.00
			isFeatured: true,
			imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80'
		},
		{
			title: 'Harare Worship Night',
			description: 'Unplugged worship session in the CBD.',
			date: new Date('2026-02-20T18:00:00'),
			location: 'PAOZ City Church',
			type: 'MEETUP' as const,
			price: 0,
			isFeatured: false,
			imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80'
		},
		{
			title: 'Business Masterclass',
			description: 'Learn how to scale your startup with industry experts.',
			date: new Date('2026-03-10T09:00:00'),
			location: 'Rainbow Towers',
			type: 'WORKSHOP' as const,
			price: 2000, // $20.00
			isFeatured: true,
			imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80'
		},
		{
			title: 'Campus Invasion: UZ',
			description: 'Evangelism and music at the University of Zimbabwe.',
			date: new Date('2026-04-05T12:00:00'),
			location: 'UZ Great Hall',
			type: 'MEETUP' as const,
			price: 0,
			isFeatured: false
		},
		{
			title: 'Young Couples Dinner',
			description: 'Building strong foundations for new marriages.',
			date: new Date('2026-05-14T19:00:00'),
			location: 'Doon Estate',
			type: 'MEETUP' as const,
			price: 5000,
			isFeatured: false
		},
		{
			title: 'Tech Skills Workshop',
			description: 'Introduction to coding and digital marketing.',
			date: new Date('2026-06-01T10:00:00'),
			location: 'Innovation Hub',
			type: 'WORKSHOP' as const,
			price: 1000,
			isFeatured: false
		},
		{
			title: 'Bulawayo Revival',
			description: 'A weekend of prayer and fasting in the City of Kings.',
			date: new Date('2026-07-20T18:00:00'),
			location: 'Large City Hall',
			type: 'CAMP' as const,
			price: 0,
			isFeatured: true
		},
		{
			title: 'Creative Arts Summit',
			description: 'For musicians, photographers, and designers.',
			date: new Date('2026-09-10T09:00:00'),
			location: 'Theatre in the Park',
			type: 'WORKSHOP' as const,
			price: 1500,
			isFeatured: false
		},
		{
			title: 'Online Prayer Marathon',
			description: '12 hours of non-stop prayer via Zoom.',
			date: new Date('2026-01-15T06:00:00'),
			location: 'Zoom (Online)',
			type: 'MEETUP' as const,
			price: 0,
			isFeatured: false
		},
		{
			title: 'End of Year Gala',
			description: 'Celebrating what God has done in 2026.',
			date: new Date('2026-12-10T18:00:00'),
			location: 'Celebration Centre',
			type: 'MEETUP' as const,
			price: 3000,
			isFeatured: true
		}
	]);

	// 4. Seed Groups
	console.log('👥 Seeding Groups...');
	await db.insert(schema.groups).values([
		{ name: 'UZ Campus Connect', leader_name: 'Tinashe M.', meetingTime: 'Wed 17:00', type: 'CAMPUS', description: 'Fellowship for UZ students.' },
		{ name: 'NUST Christian Union', leader_name: 'Busi N.', meetingTime: 'Fri 13:00', type: 'CAMPUS', description: 'NUST Bulawayo chapter.' },
		{ name: 'Marketplace Movers', leader_name: 'Sarah K.', meetingTime: '1st Fri Monthly', type: 'PRO', description: 'Entrepreneurs networking.' },
		{ name: 'Medical Professionals', leader_name: 'Dr. Gumbo', meetingTime: 'Last Sat Monthly', type: 'PRO', description: 'Doctors and nurses fellowship.' },
		{ name: 'Tech Bros & Sis', leader_name: 'Simba Dev', meetingTime: 'Discord 24/7', type: 'INTEREST', description: 'Coding and faith.' },
		{ name: 'Worship Team', leader_name: 'Pastor John', meetingTime: 'Tue 18:00', type: 'INTEREST', description: 'National worship team rehearsals.' },
		{ name: 'Online Bible Study', leader_name: 'Mai Chipo', meetingTime: 'Mon 20:00', type: 'ONLINE', description: 'Zoom bible study for diaspora.' },
		{ name: 'Young Mums', leader_name: 'Rudo C.', meetingTime: 'Thu 10:00', type: 'INTEREST', description: 'Support group for new mothers.' },
		{ name: 'Midlands State Connect', leader_name: 'Tapiwa', meetingTime: 'Wed 18:00', type: 'CAMPUS', description: 'MSU Gweru chapter.' },
		{ name: 'Legal Eagles', leader_name: 'Advocate Z.', meetingTime: 'Monthly', type: 'PRO', description: 'Lawyers and law students.' },
	]);

	// 5. Seed Blogs (Linked to Users)
	console.log('✍️ Seeding Blogs...');
	await db.insert(schema.blogs).values([
		{ title: 'Why Community Matters', category: 'Spiritual', summary: 'We were not meant to walk alone.', content: 'Full article content here...', authorId: userIds[1] },
		{ title: 'Balancing Faith and Career', category: 'Career', summary: 'How to be a light in the workplace.', content: 'Full article content here...', authorId: userIds[2] },
		{ title: 'The Power of Prayer', category: 'Spiritual', summary: 'Prayer changes things.', content: 'Full article content here...', authorId: userIds[1] },
		{ title: 'Highlights from Camp 2024', category: 'Events', summary: 'A look back at an amazing weekend.', content: 'Full article content here...', authorId: userIds[0] },
		{ title: 'Starting a Business 101', category: 'Business', summary: 'Tips for young entrepreneurs.', content: 'Full article content here...', authorId: userIds[2] },
		{ title: 'Dating with Purpose', category: 'Relationships', summary: 'Godly principles for relationships.', content: 'Full article content here...', authorId: userIds[1] },
		{ title: 'Mental Health for Christians', category: 'Wellness', summary: 'It is okay not to be okay.', content: 'Full article content here...', authorId: userIds[3] },
		{ title: 'Understanding the Bible', category: 'Spiritual', summary: 'How to read scripture effectively.', content: 'Full article content here...', authorId: userIds[1] },
		{ title: 'Financial Stewardship', category: 'Business', summary: 'Managing your money God’s way.', content: 'Full article content here...', authorId: userIds[2] },
		{ title: 'Serving in the Local Church', category: 'Ministry', summary: 'Why volunteering matters.', content: 'Full article content here...', authorId: userIds[0] },
	]);

	// 6. Seed Testimonials
	console.log('💬 Seeding Testimonials...');
	await db.insert(schema.testimonials).values([
		{ name: 'Chido M.', role: 'Student', content: 'Camp changed my life! I found my purpose.', rating: 5 },
		{ name: 'Takunda', role: 'Entrepreneur', content: 'The BEP Hub helped me find my first big client.', rating: 5 },
		{ name: 'Grace', role: 'Nurse', content: 'I love the medical professionals group. So supportive.', rating: 4 },
		{ name: 'Simba', role: 'Musician', content: 'Renting equipment was so easy and affordable.', rating: 5 },
		{ name: 'Tariro', role: 'Member', content: 'The worship nights are electric!', rating: 5 },
		{ name: 'Kudzi', role: 'Student', content: 'Found great friends at UZ Connect.', rating: 5 },
		{ name: 'Nyasha', role: 'Diaspora', content: 'The online bible study keeps me connected to home.', rating: 4 },
		{ name: 'Brian', role: 'Graphic Designer', content: 'Great community for creatives.', rating: 5 },
		{ name: 'Michelle', role: 'Seeker', content: 'I felt so welcomed from day one.', rating: 5 },
		{ name: 'Panashe', role: 'Leader', content: 'Proud to be part of this movement.', rating: 5 },
	]);

	// 7. Seed Leaders
	console.log('👔 Seeding Leaders...');
	await db.insert(schema.leaders).values([
		{ name: 'Rev. T. Moyo', role: 'National Director', order: 1 },
		{ name: 'Pst. J. Banda', role: 'Provincial Leader (Harare)', order: 2 },
		{ name: 'Mrs. S. Ndlovu', role: 'Provincial Leader (Bulawayo)', order: 3 },
		{ name: 'Mr. K. Phiri', role: 'Finance Director', order: 4 },
		{ name: 'Ms. R. Green', role: 'Events Coordinator', order: 5 },
		{ name: 'Mr. T. Zulu', role: 'Media Head', order: 6 },
		{ name: 'Pst. M. Charamba', role: 'Spiritual Advisor', order: 7 },
		{ name: 'Dr. L. Gwisai', role: 'BEP Coordinator', order: 8 },
		{ name: 'Mrs. T. Chigumba', role: 'Intercession Lead', order: 9 },
		{ name: 'Mr. B. Mpofu', role: 'Logistics', order: 10 },
	]);

	// 8. Seed FAQs
	console.log('❓ Seeding FAQs...');
	await db.insert(schema.faqs).values([
		{ question: 'How do I join a group?', answer: 'Go to the Connect page and click "Request to Join" on a group card.', order: 1 },
		{ question: 'Is there a fee for Camp?', answer: 'Yes, camp fees cover accommodation and food. See the Events page for details.', order: 2 },
		{ question: 'Can I rent equipment if I am not a member?', answer: 'Rentals are prioritized for members, but non-members can rent at a standard rate.', order: 3 },
		{ question: 'How do I list my business?', answer: 'Create an account, go to BEP Hub, and click "Register Business".', order: 4 },
		{ question: 'Where are you located?', answer: 'We are a national ministry with branches in every province.', order: 5 },
		{ question: 'What age group is this for?', answer: 'Primarily for young adults aged 18-35.', order: 6 },
		{ question: 'How can I donate?', answer: 'Contact our finance department or use the banking details on the About page.', order: 7 },
		{ question: 'Do you offer counseling?', answer: 'Yes, we have pastoral counseling available. Use the contact form.', order: 8 },
		{ question: 'How do I volunteer?', answer: 'Speak to a leader at your local branch or email us.', order: 9 },
		{ question: 'Is transportation provided for events?', answer: 'Usually, chapters organize their own transport. Check with your leader.', order: 10 },
	]);

	// 9. Seed BEP Profiles (Linked to Users)
	console.log('💼 Seeding BEP Profiles...');
	await db.insert(schema.bepProfiles).values(
		userIds.map((uid, index) => ({
			userId: uid,
			businessName: `Business of User ${index + 1}`,
			industry: index % 2 === 0 ? 'Technology' : 'Services',
			description: 'Providing excellence in the marketplace.',
			websiteUrl: 'https://example.com',
			isVerified: index < 5 // First 5 are verified
		}))
	);

	// 10. Seed Equipment
	console.log('📷 Seeding Equipment...');
	await db.insert(schema.equipment).values([
		{ name: 'Sony A7III Camera', description: 'Full frame mirrorless camera.', status: 'AVAILABLE', dailyRate: 2000 },
		{ name: 'DJI Ronin S Gimbal', description: 'Stabilizer for cameras.', status: 'RENTED', dailyRate: 1500 },
		{ name: 'Canon 50mm Lens', description: 'Prime lens f/1.8.', status: 'AVAILABLE', dailyRate: 500 },
		{ name: 'Rode Wireless Go II', description: 'Wireless microphone system.', status: 'AVAILABLE', dailyRate: 1000 },
		{ name: 'Godox SL60W Light', description: 'Continuous video light.', status: 'MAINTENANCE', dailyRate: 800 },
		{ name: 'Zoom H6 Recorder', description: 'Handy audio recorder.', status: 'AVAILABLE', dailyRate: 1200 },
		{ name: 'Green Screen Kit', description: 'Background stand and cloth.', status: 'AVAILABLE', dailyRate: 500 },
		{ name: 'Projector 4K', description: 'High definition projector.', status: 'RENTED', dailyRate: 3000 },
		{ name: 'PA System Small', description: '2 Speakers and Mixer.', status: 'AVAILABLE', dailyRate: 5000 },
		{ name: 'MacBook Pro 16', description: 'Editing laptop.', status: 'AVAILABLE', dailyRate: 4000 },
	]);

	// 11. Seed Statistics (Linked to Users)
	console.log('📊 Seeding Statistics...');
	await db.insert(schema.statistics).values([
		{ districtName: 'Harare East', date: '2025-11-01', attendanceCount: 120, salvationsCount: 5, submittedBy: userIds[1] },
		{ districtName: 'Harare West', date: '2025-11-01', attendanceCount: 85, salvationsCount: 2, submittedBy: userIds[1] },
		{ districtName: 'Bulawayo Central', date: '2025-11-01', attendanceCount: 200, salvationsCount: 10, submittedBy: userIds[2] },
		{ districtName: 'Gweru', date: '2025-11-01', attendanceCount: 50, salvationsCount: 1, submittedBy: userIds[2] },
		{ districtName: 'Mutare', date: '2025-11-01', attendanceCount: 60, salvationsCount: 3, submittedBy: userIds[1] },
		{ districtName: 'Harare East', date: '2025-12-01', attendanceCount: 130, salvationsCount: 0, submittedBy: userIds[1] },
		{ districtName: 'Harare West', date: '2025-12-01', attendanceCount: 90, salvationsCount: 2, submittedBy: userIds[1] },
		{ districtName: 'Bulawayo Central', date: '2025-12-01', attendanceCount: 210, salvationsCount: 5, submittedBy: userIds[2] },
		{ districtName: 'Masvingo', date: '2025-12-01', attendanceCount: 45, salvationsCount: 0, submittedBy: userIds[2] },
		{ districtName: 'Chinhoyi', date: '2025-12-01', attendanceCount: 40, salvationsCount: 1, submittedBy: userIds[1] },
	]);

	// 12. Seed Inquiries
	console.log('📩 Seeding Inquiries...');
	await db.insert(schema.inquiries).values([
		{ name: 'John Doe', email: 'john@test.com', message: 'I want to join a group.', type: 'JOIN_GROUP', status: 'PENDING' },
		{ name: 'Jane Doe', email: 'jane@test.com', message: 'Please pray for my family.', type: 'PRAYER', status: 'PENDING' },
		{ name: 'Visitor 1', email: 'v1@test.com', message: 'When is the next camp?', type: 'GENERAL', status: 'RESOLVED' },
		{ name: 'Visitor 2', email: 'v2@test.com', message: 'How do I donate?', type: 'GENERAL', status: 'PENDING' },
		{ name: 'Student', email: 'student@uz.ac.zw', message: 'Is there a bus for the event?', type: 'GENERAL', status: 'PENDING' },
		{ name: 'Musician', email: 'music@band.com', message: 'Can we play at the event?', type: 'GENERAL', status: 'PENDING' },
		{ name: 'Parent', email: 'parent@gmail.com', message: 'Is the camp safe?', type: 'GENERAL', status: 'RESOLVED' },
		{ name: 'Sponsor', email: 'sponsor@corp.com', message: 'We want to sponsor the gala.', type: 'GENERAL', status: 'PENDING' },
		{ name: 'Pastor', email: 'pastor@church.com', message: 'Requesting a visit.', type: 'GENERAL', status: 'PENDING' },
		{ name: 'Anonymous', email: 'anon@mail.com', message: 'I need help.', type: 'PRAYER', status: 'PENDING' },
	]);

	console.log('✅ Database Seeded Successfully!');
}