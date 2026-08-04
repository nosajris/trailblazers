// -----------------------------------------------------------------------------
// Seed content for Trailblazers (PAOZ Young Adults).
// Every array here has at least 10 rows so `npm run seed` demonstrates a fully
// populated CMS/admin experience end to end. Image paths reference files that
// already exist under apps/web/static -> /images (see public/images).
// -----------------------------------------------------------------------------

export const usersData = [
	{ email: 'admin@paoz.test', password: 'password123', fullName: 'Admin User', role: 'ADMIN' as const },
	{ email: 'secretary@paoz.org', password: 'secret', fullName: 'Rutendo Chikafu', role: 'SECRETARY' as const },
	{ email: 'leader@paoz.org', password: 'secret', fullName: 'Sarah Leader', role: 'LEADER' as const },
	{ email: 'member@paoz.org', password: 'secret', fullName: 'John Member', role: 'MEMBER' as const },
	{ email: 'entrepreneur@paoz.org', password: 'secret', fullName: 'Mike Business', role: 'MEMBER' as const },
	{ email: 'tinashe.moyo@paoz.org', password: 'secret', fullName: 'Tinashe Moyo', role: 'LEADER' as const },
	{ email: 'chiedza.mapfumo@paoz.org', password: 'secret', fullName: 'Chiedza Mapfumo', role: 'MEMBER' as const },
	{ email: 'blessing.ncube@paoz.org', password: 'secret', fullName: 'Blessing Ncube', role: 'LEADER' as const },
	{ email: 'rutendo.gwenzi@paoz.org', password: 'secret', fullName: 'Rutendo Gwenzi', role: 'MEMBER' as const },
	{ email: 'tapiwa.chirwa@paoz.org', password: 'secret', fullName: 'Tapiwa Chirwa', role: 'MEMBER' as const }
];

export const eventsData = [
	{
		id: 1,
		title: 'National Camp 2026: IGNITED FOR IMPACT',
		description:
			'Join hundreds of young adults for the most anticipated event of the year. Experience powerful worship, dynamic speakers, and build friendships that last a lifetime.',
		date: new Date('2026-08-13T14:00:00'),
		location: 'Resurrection Center, Harare',
		imageUrl: '/images/camp.jpg',
		type: 'CAMP' as const,
		price: 5000,
		earlyBirdDeadline: new Date('2026-06-01'),
		capacity: 500,
		registeredCount: 312,
		isFeatured: true
	},
	{
		id: 2,
		title: 'Catalyst Worship Night',
		description: 'An evening of powerful worship, prayer, and community.',
		date: new Date('2026-08-21T18:00:00'),
		location: 'Main Auditorium, Harare',
		imageUrl: '/images/wallpaper01.jpg',
		type: 'MEETUP' as const,
		price: 0,
		capacity: 300,
		registeredCount: 145,
		isFeatured: false
	},
	{
		id: 3,
		title: 'Amplify Leadership Conference',
		description: 'A weekend dedicated to equipping you for influence in the marketplace and beyond.',
		date: new Date('2026-10-10T09:00:00'),
		location: 'Conference Hall, Harare',
		imageUrl: '/images/wallpaper05.jpeg',
		type: 'WORKSHOP' as const,
		price: 1500,
		capacity: 150,
		registeredCount: 62,
		isFeatured: false
	},
	{
		id: 4,
		title: 'BEP Hub Pitch Night',
		description: 'Young entrepreneurs pitch their businesses for mentorship, funding leads, and community support.',
		date: new Date('2026-09-05T17:30:00'),
		location: 'Innovation Hub, Harare',
		imageUrl: '/images/image06.jpeg',
		type: 'WORKSHOP' as const,
		price: 0,
		capacity: 120,
		registeredCount: 48,
		isFeatured: false
	},
	{
		id: 5,
		title: 'Sunrise Prayer & Fast',
		description: 'A city-wide sunrise gathering of prayer and fasting to open the new season.',
		date: new Date('2026-08-02T05:30:00'),
		location: 'Resurrection Center, Harare',
		imageUrl: '/images/slider06.jpeg',
		type: 'MEETUP' as const,
		price: 0,
		capacity: 400,
		registeredCount: 201,
		isFeatured: false
	},
	{
		id: 6,
		title: 'Marketplace Summit: Faith at Work',
		description: 'Practical teaching on integrating faith and excellence in your career or business.',
		date: new Date('2026-11-14T09:00:00'),
		location: 'Rainbow Towers, Harare',
		imageUrl: '/images/image14.jpeg',
		type: 'WORKSHOP' as const,
		price: 2000,
		capacity: 200,
		registeredCount: 33,
		isFeatured: false
	},
	{
		id: 7,
		title: 'Worship Night: Unshaken',
		description: 'A night set apart for undistracted worship across all our hubs.',
		date: new Date('2026-09-19T18:30:00'),
		location: 'NUST Auditorium, Bulawayo',
		imageUrl: '/images/wallpaper02.jpg',
		type: 'MEETUP' as const,
		price: 0,
		capacity: 250,
		registeredCount: 88,
		isFeatured: false
	},
	{
		id: 8,
		title: 'Community Outreach Day',
		description: 'Serving our neighbours through food distribution, cleanups, and prayer walks.',
		date: new Date('2026-08-29T08:00:00'),
		location: 'Mbare Community Grounds, Harare',
		imageUrl: '/images/image18.jpeg',
		type: 'MEETUP' as const,
		price: 0,
		capacity: 180,
		registeredCount: 97,
		isFeatured: false
	},
	{
		id: 9,
		title: 'New Season Consecration Service',
		description: 'A dedicated evening of prayer and consecration as we step into a new season together.',
		date: new Date('2026-01-04T18:00:00'),
		location: 'Resurrection Center, Harare',
		imageUrl: '/images/slider07.jpeg',
		type: 'MEETUP' as const,
		price: 0,
		capacity: 500,
		registeredCount: 420,
		isFeatured: false
	},
	{
		id: 10,
		title: 'Back-to-Campus Send-off',
		description: 'Commissioning students heading back to university with prayer, resources, and encouragement.',
		date: new Date('2026-01-18T15:00:00'),
		location: 'Great Zimbabwe University Chapel, Masvingo',
		imageUrl: '/images/image21.jpeg',
		type: 'MEETUP' as const,
		price: 0,
		capacity: 220,
		registeredCount: 176,
		isFeatured: false
	}
];

export const blogsData = [
	{
		id: 1,
		title: '5 Takeaways From Our Winter Conference',
		category: 'EVENT RECAP',
		summary: 'It was a powerful weekend of growth and connection.',
		content:
			'Our Winter Conference brought together young adults from every hub for three days of teaching, worship, and community. Here are five things that stood out: the power of showing up consistently, how small groups multiply growth, why rest is a spiritual discipline, the value of mentorship, and how service reshapes perspective.',
		imageUrl: '/images/slider03.jpeg'
	},
	{
		id: 2,
		title: 'How to Lead When You Don’t Feel Ready',
		category: 'LEADERSHIP INSIGHTS',
		summary: 'A few thoughts on stepping into your calling.',
		content:
			'Nobody feels fully ready before their first leadership assignment. This post walks through practical steps for leading with integrity while you are still growing — including finding a mentor, staying teachable, and leaning on your team.',
		imageUrl: '/images/image01.jpeg'
	},
	{
		id: 3,
		title: 'Behind the BEP Hub: Three Businesses to Watch',
		category: 'BEP HUB',
		summary: 'Meet three entrepreneurs turning their calling into a company.',
		content:
			'From graphic design to bakery ventures, our Business & Entrepreneurs Hub is producing founders who build with integrity. We sat down with three of them to hear how faith shapes the way they run their companies.',
		imageUrl: '/images/image06.jpeg'
	},
	{
		id: 4,
		title: 'A Morning Devotional Habit That Actually Sticks',
		category: 'DEVOTIONAL',
		summary: 'Small, sustainable steps beat ambitious ones that fizzle out.',
		content:
			'Instead of committing to an hour a day, start with five focused minutes. This devotional guide walks through a simple read-reflect-pray rhythm you can keep even on your busiest weeks.',
		imageUrl: '/images/image09.jpeg'
	},
	{
		id: 5,
		title: 'What Our Outreach Day Taught Us About Serving Well',
		category: 'MISSIONS',
		summary: 'Serving isn’t about the spotlight — it’s about showing up.',
		content:
			'Over 90 volunteers packed food parcels, cleaned public spaces, and prayed with neighbours in Mbare this month. Here’s what the team learned about consistency, humility, and building trust in a community over time.',
		imageUrl: '/images/image18.jpeg'
	},
	{
		id: 6,
		title: 'Testimony: From Burnout to Breakthrough',
		category: 'TESTIMONY',
		summary: 'One member’s journey through a season of exhaustion into renewed purpose.',
		content:
			'After two years of grinding through university and a part-time job, one of our members hit a wall. This is her honest account of the small group that walked with her back to health — spiritually, mentally, and physically.',
		imageUrl: '/images/image11.jpeg'
	},
	{
		id: 7,
		title: 'Building Community on Campus: A Leader’s Guide',
		category: 'LEADERSHIP INSIGHTS',
		summary: 'Practical tips for starting and sustaining a thriving campus group.',
		content:
			'From choosing a consistent meeting time to creating space for real conversation, this guide is written by our campus group leaders for anyone starting a new hub this semester.',
		imageUrl: '/images/image04.jpeg'
	},
	{
		id: 8,
		title: 'Why We Fast Together as a Community',
		category: 'DEVOTIONAL',
		summary: 'Fasting isn’t about performance — it’s about posture.',
		content:
			'Ahead of our Sunrise Prayer & Fast gathering, our pastoral team shares the biblical foundations of corporate fasting and practical guidance for first-timers.',
		imageUrl: '/images/slider06.jpeg'
	},
	{
		id: 9,
		title: 'Marketplace Summit Recap: Faith at Work',
		category: 'EVENT RECAP',
		summary: 'Highlights and quotable moments from this year’s summit.',
		content:
			'Business leaders and young professionals gathered to talk about integrity, excellence, and calling in the workplace. Here are the top five quotes and takeaways from the day.',
		imageUrl: '/images/image14.jpeg'
	},
	{
		id: 10,
		title: 'Prayer Guide for the New Season',
		category: 'DEVOTIONAL',
		summary: 'Seven days of focused prayer prompts to start the year strong.',
		content:
			'Use this seven-day prayer guide individually or with your small group as we step into a new season together — covering gratitude, direction, relationships, and purpose.',
		imageUrl: '/images/slider07.jpeg'
	}
];

export const groupsData = [
	{
		id: 1,
		name: 'Campus Connect (UoH)',
		type: 'CAMPUS' as const,
		leader: 'David & Sarah',
		dayTime: 'Tuesdays @ 7PM',
		imageUrl: '/images/wallpaper04.jpg',
		description: 'For University of Harare students.'
	},
	{
		id: 2,
		name: 'Marketplace Movers',
		type: 'PRO' as const,
		leader: 'Michael B.',
		dayTime: 'Thursdays @ 6AM',
		imageUrl: '/images/image06.jpeg',
		description: 'For young professionals.'
	},
	{
		id: 3,
		name: 'Downtown Creatives',
		type: 'INTEREST' as const,
		leader: 'Jane Smith',
		dayTime: 'Wednesdays @ 6PM',
		imageUrl: '/images/wallpaper06.jpg',
		description: 'For artists and musicians.'
	},
	{
		id: 4,
		name: 'NUST Campus Fire',
		type: 'CAMPUS' as const,
		leader: 'Blessing Ncube',
		dayTime: 'Mondays @ 5:30PM',
		imageUrl: '/images/image03.jpeg',
		description: 'For NUST students in Bulawayo.'
	},
	{
		id: 5,
		name: 'MSU Ignite',
		type: 'CAMPUS' as const,
		leader: 'Tapiwa Chirwa',
		dayTime: 'Tuesdays @ 6PM',
		imageUrl: '/images/image05.jpeg',
		description: 'For Midlands State University students in Gweru.'
	},
	{
		id: 6,
		name: 'Great Zimbabwe Grace',
		type: 'CAMPUS' as const,
		leader: 'Rutendo Gwenzi',
		dayTime: 'Wednesdays @ 5PM',
		imageUrl: '/images/image21.jpeg',
		description: 'For Great Zimbabwe University students in Masvingo.'
	},
	{
		id: 7,
		name: 'Tech & Faith Professionals',
		type: 'PRO' as const,
		leader: 'Tinashe Moyo',
		dayTime: 'Thursdays @ 7PM (Online)',
		imageUrl: '/images/image15.jpeg',
		description: 'For developers, designers, and IT professionals.'
	},
	{
		id: 8,
		name: 'Creatives Collective Bulawayo',
		type: 'INTEREST' as const,
		leader: 'Chiedza Mapfumo',
		dayTime: 'Fridays @ 6PM',
		imageUrl: '/images/image10.jpeg',
		description: 'Photographers, designers, and content creators in Bulawayo.'
	},
	{
		id: 9,
		name: 'Diaspora Online Connect',
		type: 'ONLINE' as const,
		leader: 'Sarah Leader',
		dayTime: 'Sundays @ 8PM CAT',
		imageUrl: '/images/image17.jpeg',
		description: 'For Trailblazers members living abroad.'
	},
	{
		id: 10,
		name: 'Newlyweds & Young Families',
		type: 'INTEREST' as const,
		leader: 'John & Chiedza',
		dayTime: 'Second Saturday @ 4PM',
		imageUrl: '/images/image08.jpeg',
		description: 'For young couples navigating marriage and family life together.'
	}
];

export const bepData = [
	{
		id: 1,
		userId: 4,
		businessName: 'Pixel Perfect Design',
		industry: 'Creative Services',
		description: 'Graphic design and branding for startups.',
		websiteUrl: 'https://example.com',
		isVerified: true
	},
	{
		id: 2,
		userId: 5,
		businessName: 'Sunrise Bakes',
		industry: 'Food & Beverage',
		description: 'Custom cakes and pastries for weddings and events.',
		websiteUrl: 'https://example.com/sunrise-bakes',
		isVerified: true
	},
	{
		id: 3,
		userId: 6,
		businessName: 'CodeCraft Zim',
		industry: 'Technology',
		description: 'Web and mobile app development for local businesses.',
		websiteUrl: 'https://example.com/codecraft',
		isVerified: true
	},
	{
		id: 4,
		userId: 7,
		businessName: 'Elevate Consulting',
		industry: 'Business Services',
		description: 'Strategy and operations consulting for small businesses.',
		websiteUrl: 'https://example.com/elevate',
		isVerified: false
	},
	{
		id: 5,
		userId: 8,
		businessName: 'GreenLeaf Organics',
		industry: 'Agriculture',
		description: 'Organic vegetables and produce delivered weekly.',
		websiteUrl: 'https://example.com/greenleaf',
		isVerified: true
	},
	{
		id: 6,
		userId: 9,
		businessName: 'Trailblazer Tech Repairs',
		industry: 'Technology',
		description: 'Phone and laptop repair services with a same-day turnaround.',
		websiteUrl: 'https://example.com/tb-repairs',
		isVerified: false
	},
	{
		id: 7,
		userId: 10,
		businessName: 'Zvakanaka Events & Décor',
		industry: 'Events',
		description: 'Event planning and décor for weddings, birthdays, and church events.',
		websiteUrl: 'https://example.com/zvakanaka',
		isVerified: true
	},
	{
		id: 8,
		userId: 2,
		businessName: 'Prime Cuts Butchery',
		industry: 'Retail',
		description: 'Quality meats sourced from local farmers.',
		websiteUrl: 'https://example.com/prime-cuts',
		isVerified: false
	},
	{
		id: 9,
		userId: 3,
		businessName: 'Faith & Finance Coaching',
		industry: 'Financial Services',
		description: 'Budgeting and financial planning rooted in biblical stewardship.',
		websiteUrl: 'https://example.com/faith-finance',
		isVerified: true
	},
	{
		id: 10,
		userId: 1,
		businessName: 'Harare Ride Logistics',
		industry: 'Transportation',
		description: 'Reliable courier and ride logistics across Harare.',
		websiteUrl: 'https://example.com/harare-ride',
		isVerified: false
	}
];

export const equipmentData = [
	{ id: 1, name: 'Sony A7III Camera Kit', description: 'Includes 24-70mm lens and 2 batteries.', dailyRate: 2500, status: 'AVAILABLE' as const, imageUrl: '/images/sermon1.jpg' },
	{ id: 2, name: 'DJI Ronin S Gimbal', description: 'Professional 3-axis stabilizer.', dailyRate: 1500, status: 'AVAILABLE' as const, imageUrl: '/images/sermon2.jpg' },
	{ id: 3, name: 'Canon EOS R6 Camera Kit', description: 'Full-frame mirrorless with 24-105mm lens.', dailyRate: 2800, status: 'AVAILABLE' as const, imageUrl: '/images/image02.jpg' },
	{ id: 4, name: 'Rode Wireless GO II Mic Kit', description: 'Dual-channel wireless lavalier mic system.', dailyRate: 800, status: 'AVAILABLE' as const, imageUrl: '/images/image07.jpeg' },
	{ id: 5, name: 'Manfrotto Tripod', description: 'Heavy-duty fluid head video tripod.', dailyRate: 400, status: 'AVAILABLE' as const, imageUrl: '/images/image12.jpeg' },
	{ id: 6, name: 'Godox Softbox Lighting Kit', description: 'Two-point continuous lighting kit with stands.', dailyRate: 900, status: 'MAINTENANCE' as const, imageUrl: '/images/image13.jpeg' },
	{ id: 7, name: 'Bose L1 PA System', description: 'Portable line-array PA system for small venues.', dailyRate: 1800, status: 'RENTED' as const, imageUrl: '/images/image16.jpeg' },
	{ id: 8, name: 'MacBook Pro Editing Station', description: '16-inch M-series MacBook Pro with editing software installed.', dailyRate: 2200, status: 'AVAILABLE' as const, imageUrl: '/images/image19.jpeg' },
	{ id: 9, name: 'DJI Mini 4 Pro Drone', description: 'Compact 4K drone for aerial event coverage.', dailyRate: 1600, status: 'AVAILABLE' as const, imageUrl: '/images/image20.jpeg' },
	{ id: 10, name: 'Shure SM7B Podcast Mic', description: 'Studio-grade dynamic mic with boom arm.', dailyRate: 600, status: 'AVAILABLE' as const, imageUrl: '/images/image22.jpeg' }
];

export const testimonialsData = [
	{ id: 1, name: 'Robin Ayala Doe', role: 'Catalyst Inc.', rating: 5, content: 'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia.' },
	{ id: 2, name: 'Sarah Johnson', role: 'Amplify Conference', rating: 5, content: 'The community has been exceptional.' },
	{ id: 3, name: 'Tinashe Moyo', role: 'Campus Connect Leader', rating: 5, content: 'This community gave me a family away from home during my university years.' },
	{ id: 4, name: 'Chiedza Mapfumo', role: 'Creatives Collective', rating: 5, content: 'I found my creative voice and my faith deepened at the same time here.' },
	{ id: 5, name: 'Blessing Ncube', role: 'NUST Campus Fire', rating: 4, content: 'The leadership training I received changed how I show up in every room I walk into.' },
	{ id: 6, name: 'Rutendo Gwenzi', role: 'Great Zimbabwe Grace', rating: 5, content: 'Sunday services feel less like an event and more like coming home.' },
	{ id: 7, name: 'Tapiwa Chirwa', role: 'MSU Ignite', rating: 5, content: 'BEP Hub gave me the mentorship I needed to finally launch my business.' },
	{ id: 8, name: 'Mike Business', role: 'Pixel Perfect Design', rating: 4, content: 'The marketplace summit reframed how I think about work as worship.' },
	{ id: 9, name: 'Rutendo Chikafu', role: 'Volunteer Team', rating: 5, content: 'Serving alongside this team has been one of the most formative seasons of my life.' },
	{ id: 10, name: 'John Member', role: 'Diaspora Online Connect', rating: 5, content: 'Even from abroad, I never feel disconnected from my church family.' }
];

export const leadersData = [
	{ id: 1, name: 'Bishop N Muparutsa', role: 'Presiding Bishop', imageUrl: '/images/presiding.jpg', order: 1 },
	{ id: 2, name: 'Rev W Machingura', role: 'National Young Adults Director', imageUrl: '/images/RevWashie.jpg', order: 2 },
	{ id: 3, name: 'Rev T Madzima', role: 'Associate Director, Young Adults', imageUrl: '/images/RevMadzima.jpg', order: 3 },
	{ id: 4, name: 'Bishop C Zowa', role: 'Regional Overseer', imageUrl: '/images/BishopZowa.jpeg', order: 4 },
	{ id: 5, name: 'Pastor Tafadzwa Moyo', role: 'Harare Hub Pastor', imageUrl: '/images/profile2.jpg', order: 5 },
	{ id: 6, name: 'Sarah Leader', role: 'Discipleship & Groups Lead', imageUrl: '/images/image08.jpeg', order: 6 },
	{ id: 7, name: 'Tinashe Moyo', role: 'Bulawayo Hub Leader', imageUrl: '/images/image10.jpeg', order: 7 },
	{ id: 8, name: 'Blessing Ncube', role: 'Worship Director', imageUrl: '/images/image15.jpeg', order: 8 },
	{ id: 9, name: 'Chiedza Mapfumo', role: 'Creative & Media Lead', imageUrl: '/images/image17.jpeg', order: 9 },
	{ id: 10, name: 'Rutendo Chikafu', role: 'BEP Hub Director', imageUrl: '/images/image23.jpeg', order: 10 }
];

export const faqsData = [
	{ id: 1, question: 'Who is the Young Adults Ministry for?', answer: 'Our ministry is for all young adults, typically from post-high school through their early 30s.', order: 1 },
	{ id: 2, question: 'What is the BEP Hub?', answer: 'The Business & Entrepreneurs Hub (BEP) is our dedicated initiative for socio-economic empowerment.', order: 2 },
	{ id: 3, question: 'How do I join a small group?', answer: 'Visit the Groups page, find one near your campus or city hub, and reach out to the leader listed — or come along to any open meetup.', order: 3 },
	{ id: 4, question: 'How can I give or tithe online?', answer: 'Online giving is being finalised for this site. In the meantime you can give via EcoCash, bank transfer, or in person — see the Give page for current options.', order: 4 },
	{ id: 5, question: 'Do you stream services online?', answer: 'Yes — our Sunday gatherings and select events are streamed live. Visit the Watch page for the current schedule and link.', order: 5 },
	{ id: 6, question: 'How do I volunteer or serve on a team?', answer: 'Head to the Serve page to see our current teams, then submit an interest form or speak to a leader after a service.', order: 6 },
	{ id: 7, question: 'Is National Camp open to first-timers?', answer: 'Absolutely — National Camp is one of the best ways to plug into the wider community, whether it is your first event or your tenth.', order: 7 },
	{ id: 8, question: 'How do I submit a prayer request?', answer: 'Use the Contact page and select "Prayer Request" as the topic — our pastoral team follows up personally within 48 hours.', order: 8 },
	{ id: 9, question: 'What safety measures are in place for younger attendees?', answer: 'All volunteers working with minors are vetted, and our venues follow clear safeguarding and check-in procedures at every gathering.', order: 9 },
	{ id: 10, question: 'How do I get involved in leadership?', answer: 'Leadership development starts in a small group. Speak to your group leader about our leadership pipeline and upcoming training cohorts.', order: 10 }
];

export const serveContentData = [
	{
		headline: 'Serve with us',
		subheadline: 'Your gifts make Sunday possible.',
		body: 'Join a team and build the church alongside friends.',
		ctaLabel: 'Ask about teams',
		ctaHref: '/contact',
		imageUrl: '/images/wallpaper04.jpg',
		status: 'PUBLISHED',
		sortOrder: 0
	},
	{
		headline: 'Worship & Production Team',
		subheadline: 'Sound, lights, and stage — make Sundays run smoothly.',
		body: 'No experience needed. We train every volunteer on the gear they will use.',
		ctaLabel: 'Join production',
		ctaHref: '/contact',
		imageUrl: '/images/image13.jpeg',
		status: 'DRAFT',
		sortOrder: 1
	},
	{
		headline: 'Welcome & Hospitality Team',
		subheadline: 'Be the first friendly face someone meets.',
		body: 'Greet, guide, and help newcomers feel at home from the moment they arrive.',
		ctaLabel: 'Join welcome team',
		ctaHref: '/contact',
		imageUrl: '/images/image01.jpeg',
		status: 'DRAFT',
		sortOrder: 2
	},
	{
		headline: 'Kids & Youth Volunteers',
		subheadline: 'Shape the next generation.',
		body: 'Serve alongside our children and youth ministries during weekend gatherings.',
		ctaLabel: 'Serve with kids',
		ctaHref: '/contact',
		imageUrl: '/images/image04.jpeg',
		status: 'DRAFT',
		sortOrder: 3
	},
	{
		headline: 'Media & Content Team',
		subheadline: 'Photography, video, and social media.',
		body: 'Help tell the story of what God is doing through content that reaches beyond our walls.',
		ctaLabel: 'Join media team',
		ctaHref: '/contact',
		imageUrl: '/images/image19.jpeg',
		status: 'DRAFT',
		sortOrder: 4
	},
	{
		headline: 'Outreach & Missions Team',
		subheadline: 'Serve the wider community.',
		body: 'From food drives to prayer walks, join a team taking the church beyond the building.',
		ctaLabel: 'Join outreach',
		ctaHref: '/contact',
		imageUrl: '/images/image18.jpeg',
		status: 'DRAFT',
		sortOrder: 5
	},
	{
		headline: 'BEP Hub Mentors',
		subheadline: 'Coach a young entrepreneur.',
		body: 'Share your business experience with members building companies through the BEP Hub.',
		ctaLabel: 'Become a mentor',
		ctaHref: '/bep-hub',
		imageUrl: '/images/image06.jpeg',
		status: 'DRAFT',
		sortOrder: 6
	},
	{
		headline: 'Prayer Team',
		subheadline: 'Intercede for our community.',
		body: 'Join a rotating prayer team covering services, camps, and member requests.',
		ctaLabel: 'Join prayer team',
		ctaHref: '/contact',
		imageUrl: '/images/slider06.jpeg',
		status: 'ARCHIVED',
		sortOrder: 7
	},
	{
		headline: 'Camp Logistics Crew',
		subheadline: 'Help National Camp run without a hitch.',
		body: 'Set-up, registration, and logistics volunteers needed each August.',
		ctaLabel: 'Join camp crew',
		ctaHref: '/events',
		imageUrl: '/images/camp.jpg',
		status: 'ARCHIVED',
		sortOrder: 8
	},
	{
		headline: 'Diaspora Online Team',
		subheadline: 'Serve members watching from abroad.',
		body: 'Moderate chat, coordinate watch parties, and keep our online family connected.',
		ctaLabel: 'Join online team',
		ctaHref: '/watch',
		imageUrl: '/images/image17.jpeg',
		status: 'ARCHIVED',
		sortOrder: 9
	}
];

export const newcomerContentData = [
	{
		headline: "I'm new here",
		subheadline: 'Start your journey with Trailblazers.',
		body: 'We saved a seat for you. Plan a visit and meet the team.',
		ctaLabel: 'Plan a visit',
		ctaHref: '/plan-a-visit',
		imageUrl: '/images/slider03.jpeg',
		status: 'PUBLISHED',
		sortOrder: 0
	},
	{
		headline: 'What to expect on your first Sunday',
		subheadline: 'No dress code, just come as you are.',
		body: 'Services run about 90 minutes with worship, teaching, and time to connect afterward.',
		ctaLabel: 'See service times',
		ctaHref: '/plan-a-visit',
		imageUrl: '/images/slider04.jpeg',
		status: 'DRAFT',
		sortOrder: 1
	},
	{
		headline: 'Bring a friend',
		subheadline: 'Community grows best when it is shared.',
		body: 'Invite a friend to join you — we will have a seat ready for both of you.',
		ctaLabel: 'Invite a friend',
		ctaHref: '/contact',
		imageUrl: '/images/image08.jpeg',
		status: 'DRAFT',
		sortOrder: 2
	},
	{
		headline: 'Find your campus hub',
		subheadline: 'Wherever you study, we are probably nearby.',
		body: 'Browse our campus groups across Harare, Bulawayo, Gweru, and Masvingo.',
		ctaLabel: 'Browse groups',
		ctaHref: '/groups',
		imageUrl: '/images/wallpaper04.jpg',
		status: 'DRAFT',
		sortOrder: 3
	},
	{
		headline: 'Watch from anywhere',
		subheadline: 'Not ready to visit in person? Start online.',
		body: 'Join our livestream every Sunday and connect with our online community.',
		ctaLabel: 'Watch online',
		ctaHref: '/watch',
		imageUrl: '/images/sermon1.jpg',
		status: 'DRAFT',
		sortOrder: 4
	},
	{
		headline: 'Meet the team before you arrive',
		subheadline: 'Get to know our leadership.',
		body: 'See who is leading each ministry so a familiar face greets you on Sunday.',
		ctaLabel: 'Meet our leaders',
		ctaHref: '/#leaders',
		imageUrl: '/images/presiding.jpg',
		status: 'DRAFT',
		sortOrder: 5
	},
	{
		headline: 'Questions before you visit?',
		subheadline: 'We are happy to help.',
		body: 'Check our FAQ or reach out directly — no question is too small.',
		ctaLabel: 'View FAQs',
		ctaHref: '/faq',
		imageUrl: '/images/image09.jpeg',
		status: 'DRAFT',
		sortOrder: 6
	},
	{
		headline: 'Parking & directions',
		subheadline: 'Getting here is easy.',
		body: 'Free parking is available on-site, with greeters ready to point you in the right direction.',
		ctaLabel: 'Get directions',
		ctaHref: '/plan-a-visit',
		imageUrl: '/images/wallpaper07.jpg',
		status: 'ARCHIVED',
		sortOrder: 7
	},
	{
		headline: 'Kids & youth on Sunday',
		subheadline: "We've got your family covered.",
		body: 'Age-appropriate programming runs alongside every main service.',
		ctaLabel: 'Learn more',
		ctaHref: '/contact',
		imageUrl: '/images/image04.jpeg',
		status: 'ARCHIVED',
		sortOrder: 8
	},
	{
		headline: 'Your next step after visiting',
		subheadline: 'From guest to family.',
		body: 'After your first visit, our team will follow up to help you find a group and get connected.',
		ctaLabel: 'Take the next step',
		ctaHref: '/groups',
		imageUrl: '/images/image11.jpeg',
		status: 'ARCHIVED',
		sortOrder: 9
	}
];

export const parentContentData = [
	{
		headline: 'For parents',
		subheadline: 'What we believe about the next generation.',
		body: 'Safety, community, and discipleship matter here.',
		ctaLabel: 'Talk to us',
		ctaHref: '/contact',
		imageUrl: '/images/image01.jpeg',
		status: 'PUBLISHED',
		sortOrder: 0
	},
	{
		headline: 'Safety is our priority',
		subheadline: 'Every volunteer is vetted and trained.',
		body: 'Our safeguarding policy covers check-in, supervision ratios, and background checks for all youth and kids volunteers.',
		ctaLabel: 'Read our safety policy',
		ctaHref: '/contact',
		imageUrl: '/images/image04.jpeg',
		status: 'DRAFT',
		sortOrder: 1
	},
	{
		headline: 'Helping your young adult find community',
		subheadline: 'A soft landing for students leaving home.',
		body: 'Campus hubs give first-year students a family away from home from day one.',
		ctaLabel: 'See campus hubs',
		ctaHref: '/groups',
		imageUrl: '/images/image21.jpeg',
		status: 'DRAFT',
		sortOrder: 2
	},
	{
		headline: 'Partnering with you at home',
		subheadline: 'Discipleship does not stop at church.',
		body: 'We send weekly conversation guides so the teaching continues around your dinner table.',
		ctaLabel: 'Get the parent guide',
		ctaHref: '/contact',
		imageUrl: '/images/image09.jpeg',
		status: 'DRAFT',
		sortOrder: 3
	},
	{
		headline: 'Questions parents ask most',
		subheadline: "We're an open book.",
		body: 'From safety to schedules, browse the questions parents ask us most often.',
		ctaLabel: 'View FAQs',
		ctaHref: '/faq',
		imageUrl: '/images/image02.jpg',
		status: 'DRAFT',
		sortOrder: 4
	},
	{
		headline: 'Send-off Sunday for graduating students',
		subheadline: 'We celebrate every milestone with your family.',
		body: 'Each January we commission graduating and incoming students with prayer and encouragement.',
		ctaLabel: 'See upcoming events',
		ctaHref: '/events',
		imageUrl: '/images/image21.jpeg',
		status: 'ARCHIVED',
		sortOrder: 5
	},
	{
		headline: 'Financial stewardship for young adults',
		subheadline: 'Practical training, not just theory.',
		body: 'Our Faith & Finance track helps your young adult build healthy money habits early.',
		ctaLabel: 'Learn more',
		ctaHref: '/bep-hub',
		imageUrl: '/images/image14.jpeg',
		status: 'ARCHIVED',
		sortOrder: 6
	},
	{
		headline: 'Mentorship that lasts beyond a season',
		subheadline: 'Every member is paired with a small group leader.',
		body: 'Consistent, caring leadership is at the center of how we disciple young adults.',
		ctaLabel: 'Meet our leaders',
		ctaHref: '/#leaders',
		imageUrl: '/images/profile2.jpg',
		status: 'ARCHIVED',
		sortOrder: 7
	},
	{
		headline: 'Staying in the loop',
		subheadline: 'We keep parents informed too.',
		body: 'Subscribe to our newsletter for updates on events, camps, and ministry news.',
		ctaLabel: 'Subscribe',
		ctaHref: '/contact',
		imageUrl: '/images/wallpaper03.jpg',
		status: 'ARCHIVED',
		sortOrder: 8
	},
	{
		headline: "Talk to a pastor about your young adult's journey",
		subheadline: 'We are here for the whole family.',
		body: 'Reach out any time to talk through how we can support your son or daughter.',
		ctaLabel: 'Contact a pastor',
		ctaHref: '/contact',
		imageUrl: '/images/image08.jpeg',
		status: 'ARCHIVED',
		sortOrder: 9
	}
];

export const sermonSeriesData = [
	{ title: 'Faith in Motion', description: 'Daily faith that empowers young adults to lead.', coverImageUrl: '/images/sermon1.jpg' },
	{ title: 'Blueprint for Purposeful Leadership', description: 'Leading with integrity and identity in modern culture.', coverImageUrl: '/images/sermon2.jpg' },
	{ title: 'Unshaken', description: 'Standing firm in faith through uncertain seasons.', coverImageUrl: '/images/wallpaper02.jpg' },
	{ title: 'Marketplace Faith', description: 'Integrating calling, career, and Christian character.', coverImageUrl: '/images/image14.jpeg' },
	{ title: 'Roots & Wings', description: 'Building spiritual foundations while stepping into new seasons.', coverImageUrl: '/images/image09.jpeg' },
	{ title: 'Relationships That Last', description: 'Friendship, dating, and marriage from a biblical lens.', coverImageUrl: '/images/image08.jpeg' },
	{ title: 'The Generous Life', description: 'A teaching series on stewardship, giving, and trust.', coverImageUrl: '/images/image16.jpeg' },
	{ title: 'Renewed Mind', description: 'Mental and emotional health through a discipleship lens.', coverImageUrl: '/images/image11.jpeg' },
	{ title: 'Sent', description: 'A missions-focused series on outreach and evangelism.', coverImageUrl: '/images/image18.jpeg' },
	{ title: 'New Season', description: 'Consecration and vision-setting teaching for the year ahead.', coverImageUrl: '/images/slider07.jpeg' }
];

export const sermonsData = [
	{
		title: 'Faith That Moves With Your Week',
		speaker: 'Pastor Tafadzwa',
		youtubeId: 'dQw4w9WgXcQ',
		scripture: 'Hebrews 11:1-6',
		summary: 'Discover how daily faith empowers young adults to lead in university, business, and community.',
		discussionGuide: '1. What step of faith is God calling you to take this week?\n2. How can our small group support your leadership journey?',
		isFeatured: true,
		seriesIndex: 0,
		daysAgo: 0
	},
	{
		title: 'The Blueprint for Purposeful Leadership',
		speaker: 'Guest Speaker Pastor Sarah',
		youtubeId: 'dQw4w9WgXcQ',
		scripture: 'Proverbs 3:5-6',
		summary: 'Understanding your divine identity and leading with integrity in modern culture.',
		discussionGuide: '1. How do you maintain Christian principles in competitive environments?\n2. Share one goal for your personal spiritual growth.',
		isFeatured: false,
		seriesIndex: 1,
		daysAgo: 7
	},
	{
		title: 'Standing When Everything Shakes',
		speaker: 'Rev W Machingura',
		youtubeId: 'dQw4w9WgXcQ',
		scripture: 'Psalm 46:1-3',
		summary: 'Finding stability in God when circumstances are uncertain.',
		discussionGuide: '1. What is currently shaking your confidence?\n2. What does it look like to fix your eyes on God this week?',
		isFeatured: false,
		seriesIndex: 2,
		daysAgo: 14
	},
	{
		title: 'Excellence as Worship',
		speaker: 'Pastor Tafadzwa',
		youtubeId: 'dQw4w9WgXcQ',
		scripture: 'Colossians 3:23-24',
		summary: 'Why the quality of your work is a spiritual act of worship.',
		discussionGuide: '1. Where in your work could you raise your standard of excellence?\n2. How does this shift your motivation?',
		isFeatured: false,
		seriesIndex: 3,
		daysAgo: 21
	},
	{
		title: 'Deep Roots, Wide Reach',
		speaker: 'Rev T Madzima',
		youtubeId: 'dQw4w9WgXcQ',
		scripture: 'Jeremiah 17:7-8',
		summary: 'Why spiritual depth matters more than spiritual busyness.',
		discussionGuide: '1. What practices help you stay rooted?\n2. What does "wide reach" look like for you this season?',
		isFeatured: false,
		seriesIndex: 4,
		daysAgo: 28
	},
	{
		title: "Dating With Purpose",
		speaker: 'Sarah Leader',
		youtubeId: 'dQw4w9WgXcQ',
		scripture: '1 Corinthians 13:4-7',
		summary: 'A practical, biblical conversation on relationships and dating well.',
		discussionGuide: '1. What does love look like practically in your current relationships?\n2. What boundaries help you honour God and others?',
		isFeatured: false,
		seriesIndex: 5,
		daysAgo: 35
	},
	{
		title: 'The Joy of Giving',
		speaker: 'Rev W Machingura',
		youtubeId: 'dQw4w9WgXcQ',
		scripture: '2 Corinthians 9:6-8',
		summary: 'Why generosity is a posture of the heart, not just a transaction.',
		discussionGuide: '1. What is one area you could be more generous in?\n2. How has giving shaped your faith in the past?',
		isFeatured: false,
		seriesIndex: 6,
		daysAgo: 42
	},
	{
		title: 'Renewing an Anxious Mind',
		speaker: 'Pastor Tafadzwa',
		youtubeId: 'dQw4w9WgXcQ',
		scripture: 'Romans 12:2',
		summary: 'Practical, faith-rooted tools for managing anxiety and mental health.',
		discussionGuide: '1. What thought patterns do you want to bring to God this week?\n2. Who can you be honest with about your mental health?',
		isFeatured: false,
		seriesIndex: 7,
		daysAgo: 49
	},
	{
		title: 'Sent, Not Just Gathered',
		speaker: 'Bishop C Zowa',
		youtubeId: 'dQw4w9WgXcQ',
		scripture: 'Matthew 28:18-20',
		summary: 'Moving from consuming church to being sent by the church.',
		discussionGuide: '1. Who is one person you could intentionally reach out to this week?\n2. What holds you back from sharing your faith?',
		isFeatured: false,
		seriesIndex: 8,
		daysAgo: 56
	},
	{
		title: 'Consecration for the New Season',
		speaker: 'Bishop N Muparutsa',
		youtubeId: 'dQw4w9WgXcQ',
		scripture: 'Joshua 3:5',
		summary: 'Setting yourself apart as we step into a new season together.',
		discussionGuide: '1. What do you sense God saying about this new season?\n2. What needs to be consecrated (set apart) in your life right now?',
		isFeatured: false,
		seriesIndex: 9,
		daysAgo: 63
	}
];

/** Extra site_settings rows beyond the 4 core keys the app currently reads (nav_links,
 *  footer_columns, seo_defaults, site_extras) — modelled on gaps found auditing
 *  elevationchurch.org (rich giving options, service times, social presence, etc.) so the
 *  CMS has realistic data ready for those features when they're built. */
export const siteSettingsExtraData = [
	{
		key: 'giving_options',
		value: {
			methods: [
				{ id: 'ecocash', label: 'EcoCash', instructions: 'Dial *151# and send to merchant code 45678.' },
				{ id: 'bank', label: 'Bank Transfer', instructions: 'CBZ Bank, Account: Trailblazers Young Adults, Branch: Borrowdale.' },
				{ id: 'cash', label: 'Give in person', instructions: 'Giving points are open before and after every Sunday gathering.' }
			],
			tithePercentageSuggestion: 10
		}
	},
	{
		key: 'service_times',
		value: {
			weekly: [
				{ day: 'Sunday', time: '9:00 AM', label: 'Main Gathering', location: 'Resurrection Center, Harare' },
				{ day: 'Sunday', time: '5:00 PM', label: 'Online Watch Party', location: 'Streamed' },
				{ day: 'Wednesday', time: '6:00 PM', label: 'Midweek Prayer', location: 'Resurrection Center, Harare' }
			]
		}
	},
	{
		key: 'social_links',
		value: {
			instagram: 'https://instagram.com/trailblazersya',
			twitter: 'https://x.com/trailblazersya',
			facebook: 'https://facebook.com/trailblazersya',
			youtube: 'https://youtube.com/@trailblazersya',
			tiktok: 'https://tiktok.com/@trailblazersya'
		}
	},
	{
		key: 'contact_info',
		value: {
			phone: '+263 77 123 4567',
			email: 'info@paoz.org',
			address: 'Resurrection Center, Borrowdale, Harare, Zimbabwe',
			officeHours: 'Mon–Fri, 9:00 AM–4:00 PM'
		}
	},
	{
		key: 'theme_colors',
		value: { primary: '#F95C4B', secondary: '#171616', gold: '#D4A24C' }
	},
	{
		key: 'annual_report',
		value: {
			year: 2025,
			headline: 'See the impact of the past year',
			fileUrl: '',
			summary: '5,000+ young adults reached, 12 campus and city hubs active, 200+ businesses supported through BEP Hub.'
		}
	}
];

export const inquiriesData = [
	{ name: 'Farai Gumbo', email: 'farai.gumbo@example.com', message: 'I would love to know more about joining a campus group in Bulawayo.', type: 'GENERAL', status: 'PENDING' },
	{ name: 'Nyasha Chirwa', email: 'nyasha.chirwa@example.com', message: 'Please pray for my final exams this month.', type: 'PRAYER', status: 'RESOLVED' },
	{ name: 'Tadiwa Mutasa', email: 'tadiwa.mutasa@example.com', message: 'Interested in listing my catering business through the BEP Hub.', type: 'BEP', status: 'PENDING' },
	{ name: 'Panashe Sibanda', email: 'panashe.sibanda@example.com', message: 'How do I sign up to volunteer on the media team?', type: 'VOLUNTEER', status: 'RESOLVED' },
	{ name: 'Kudzai Mavhunga', email: 'kudzai.mavhunga@example.com', message: 'Can I get more information about National Camp pricing for groups?', type: 'GENERAL', status: 'PENDING' },
	{ name: 'Anesu Marufu', email: 'anesu.marufu@example.com', message: 'Please pray for my family — my father is unwell.', type: 'PRAYER', status: 'PENDING' },
	{ name: 'Rufaro Chidziva', email: 'rufaro.chidziva@example.com', message: 'I would like to rent camera equipment for a community project.', type: 'GENERAL', status: 'RESOLVED' },
	{ name: 'Tanaka Museka', email: 'tanaka.museka@example.com', message: 'Interested in becoming a small group leader next semester.', type: 'VOLUNTEER', status: 'PENDING' },
	{ name: 'Vimbai Chapfika', email: 'vimbai.chapfika@example.com', message: 'What time does the Sunrise Prayer & Fast start?', type: 'GENERAL', status: 'RESOLVED' },
	{ name: 'Simba Nyathi', email: 'simba.nyathi@example.com', message: 'I want to give feedback on the Marketplace Summit — it was excellent!', type: 'GENERAL', status: 'RESOLVED' }
];

/** districtIndex/submittedByIndex are resolved against the seeded cities/users in seed.ts. */
export const statisticsData = [
	{ districtName: 'Harare', daysAgo: 7, attendanceCount: 480, salvationsCount: 12, notes: 'Strong turnout for Sunrise Prayer & Fast week.' },
	{ districtName: 'Bulawayo', daysAgo: 7, attendanceCount: 210, salvationsCount: 5, notes: 'New members from NUST orientation week.' },
	{ districtName: 'Gweru', daysAgo: 7, attendanceCount: 130, salvationsCount: 2, notes: 'MSU Ignite hosted a joint gathering with two other campus groups.' },
	{ districtName: 'Masvingo', daysAgo: 7, attendanceCount: 95, salvationsCount: 3, notes: 'Great Zimbabwe Grace saw growth after outreach day.' },
	{ districtName: 'Harare', daysAgo: 14, attendanceCount: 455, salvationsCount: 8, notes: 'Regular Sunday attendance.' },
	{ districtName: 'Bulawayo', daysAgo: 14, attendanceCount: 198, salvationsCount: 4, notes: 'Steady growth in Creatives Collective attendance.' },
	{ districtName: 'Gweru', daysAgo: 14, attendanceCount: 122, salvationsCount: 1, notes: 'Midweek prayer numbers up slightly.' },
	{ districtName: 'Masvingo', daysAgo: 14, attendanceCount: 88, salvationsCount: 0, notes: 'Exam season affecting mid-week turnout.' },
	{ districtName: 'Mutare', daysAgo: 7, attendanceCount: 76, salvationsCount: 1, notes: 'Smaller hub, consistent core group.' },
	{ districtName: 'Diaspora / Online', daysAgo: 7, attendanceCount: 340, salvationsCount: 6, notes: 'Strong watch-party turnout from UK and SA chapters.' }
];

export const auditLogsData = [
	{ action: 'CREATE', entityType: 'event', entityId: '1', details: 'Created event "National Camp 2026: IGNITED FOR IMPACT"' },
	{ action: 'UPDATE', entityType: 'sermon', entityId: '1', details: 'Marked sermon "Faith That Moves With Your Week" as featured' },
	{ action: 'PUBLISH', entityType: 'blog', entityId: '3', details: 'Published blog post "Behind the BEP Hub: Three Businesses to Watch"' },
	{ action: 'UPDATE', entityType: 'settings', entityId: 'site_extras', details: 'Updated site extras (campus list)' },
	{ action: 'CREATE', entityType: 'group', entityId: '9', details: 'Created group "Diaspora Online Connect"' },
	{ action: 'DELETE', entityType: 'testimonial', entityId: '11', details: 'Removed a duplicate testimonial submission' },
	{ action: 'UPDATE', entityType: 'inquiry', entityId: '2', details: 'Marked prayer request from Nyasha Chirwa as resolved' },
	{ action: 'CREATE', entityType: 'task', entityId: '1', details: 'Created follow-up task for new visitor outreach' },
	{ action: 'UPDATE', entityType: 'event', entityId: '8', details: 'Updated capacity for Community Outreach Day' },
	{ action: 'LOGIN', entityType: 'user', entityId: '1', details: 'Admin logged into the staff portal' }
];

export const tasksData = [
	{ title: 'Upload National Camp photo gallery', description: 'Pull highlights from the media team and publish to the Stories page.', relatedEntityType: 'event', relatedEntityId: '1', daysDue: 3 },
	{ title: 'Confirm speaker for Amplify Leadership Conference', description: 'Finalise contract and travel details with guest speaker.', relatedEntityType: 'event', relatedEntityId: '3', daysDue: 10 },
	{ title: 'Follow up with new visitors from last Sunday', description: 'Call or message everyone who filled out a plan-a-visit form this week.', relatedEntityType: 'inquiry', relatedEntityId: null, daysDue: 2 },
	{ title: 'Update Give page with EcoCash instructions', description: 'Replace the placeholder giving copy with the finalised payment options.', relatedEntityType: 'settings', relatedEntityId: 'giving_options', daysDue: 5 },
	{ title: 'Review pending BEP Hub applications', description: 'Verify business details for the three profiles awaiting approval.', relatedEntityType: 'bep_profile', relatedEntityId: null, daysDue: 4 },
	{ title: 'Record discussion guide for new sermon series', description: 'Write small group questions for "Unshaken" series episode 1.', relatedEntityType: 'sermon', relatedEntityId: null, daysDue: 6 },
	{ title: 'Order camp wristbands and lanyards', description: 'Confirm quantity with vendor based on current registration count.', relatedEntityType: 'event', relatedEntityId: '1', daysDue: 14 },
	{ title: 'Schedule social media posts for Marketplace Summit', description: 'Plan a two-week promotional cadence across Instagram and X.', relatedEntityType: 'event', relatedEntityId: '6', daysDue: 7 },
	{ title: 'Audit equipment maintenance schedule', description: 'Check status of items marked MAINTENANCE and confirm return dates.', relatedEntityType: 'equipment', relatedEntityId: null, daysDue: 9 },
	{ title: 'Prepare quarterly attendance report', description: 'Summarise statistics across all districts for leadership review.', relatedEntityType: 'statistics', relatedEntityId: null, daysDue: 12 }
];

/** CMS `pages` + `page_sections` — the home page ('/') is the one actually composed by
 *  the site today; the rest demonstrate the page-builder covering every public route. */
export const pagesData: {
	slug: string;
	title: string;
	sections: { sectionType: string; sortOrder: number; config: Record<string, unknown> }[];
}[] = [
	{
		slug: '/',
		title: 'Home',
		sections: [
			{
				sectionType: 'HERO',
				sortOrder: 0,
				config: {
					title: 'Ignited for impact',
					subtitle: 'A transformational leadership ecosystem for young adults.',
					imageUrl: '/images/wallpaper01.jpg',
					videoUrl: '',
					primaryCtaLabel: 'Plan a visit',
					primaryCtaHref: '/plan-a-visit',
					secondaryCtaLabel: 'Browse events',
					secondaryCtaHref: '/events'
				}
			},
			{ sectionType: 'EVENTS_RAIL', sortOrder: 1, config: { title: 'Upcoming events', limit: 3 } },
			{ sectionType: 'BLOG', sortOrder: 2, config: { title: 'Stories & updates', limit: 3 } },
			{ sectionType: 'TESTIMONIALS', sortOrder: 3, config: { title: 'What people are saying' } },
			{ sectionType: 'GROUPS', sortOrder: 4, config: { title: 'Connect in community' } },
			{ sectionType: 'SERVE', sortOrder: 5, config: {} },
			{ sectionType: 'LEADERS', sortOrder: 6, config: { title: 'Leadership' } },
			{ sectionType: 'IM_NEW', sortOrder: 7, config: {} },
			{ sectionType: 'PARENTS', sortOrder: 8, config: {} },
			{ sectionType: 'FAQ', sortOrder: 9, config: { title: 'Questions' } },
			{
				sectionType: 'CONTACT',
				sortOrder: 10,
				config: { title: 'We would love to hear from you', intro: 'Send us a note.' }
			}
		]
	},
	{
		slug: '/about',
		title: 'About',
		sections: [
			{
				sectionType: 'HERO',
				sortOrder: 0,
				config: { title: 'Our story', subtitle: 'Where Trailblazers came from and where we are headed.', imageUrl: '/images/wallpaper05.jpeg' }
			},
			{ sectionType: 'LEADERS', sortOrder: 1, config: { title: 'Meet the team' } },
			{ sectionType: 'FAQ', sortOrder: 2, config: { title: 'Common questions' } }
		]
	},
	{
		slug: '/ministries',
		title: 'Ministries',
		sections: [
			{
				sectionType: 'HERO',
				sortOrder: 0,
				config: { title: 'Ministries', subtitle: 'Every way to grow and get involved.', imageUrl: '/images/wallpaper06.jpg' }
			},
			{ sectionType: 'GROUPS', sortOrder: 1, config: { title: 'Find a group' } },
			{ sectionType: 'SERVE', sortOrder: 2, config: {} },
			{ sectionType: 'CUSTOM', sortOrder: 3, config: { title: 'BEP Hub', body: 'Business & entrepreneurship mentorship for young adults.', href: '/bep-hub' } }
		]
	},
	{
		slug: '/give-landing',
		title: 'Give',
		sections: [
			{
				sectionType: 'HERO',
				sortOrder: 0,
				config: { title: 'Generosity fuels the mission', subtitle: 'Every gift moves the ministry forward.', imageUrl: '/images/slider02.jpeg' }
			},
			{ sectionType: 'CUSTOM', sortOrder: 1, config: { settingsKey: 'giving_options' } }
		]
	},
	{
		slug: '/groups-landing',
		title: 'Groups',
		sections: [
			{
				sectionType: 'HERO',
				sortOrder: 0,
				config: { title: 'Find your people', subtitle: 'Campus, professional, interest, and online groups.', imageUrl: '/images/wallpaper04.jpg' }
			},
			{ sectionType: 'GROUPS', sortOrder: 1, config: { title: 'All groups' } }
		]
	},
	{
		slug: '/events-landing',
		title: 'Events',
		sections: [
			{
				sectionType: 'HERO',
				sortOrder: 0,
				config: { title: 'What is coming up', subtitle: 'Camps, conferences, and gatherings.', imageUrl: '/images/wallpaper01.jpg' }
			},
			{ sectionType: 'EVENTS_RAIL', sortOrder: 1, config: { title: 'All upcoming events', limit: 10 } }
		]
	},
	{
		slug: '/serve-landing',
		title: 'Serve',
		sections: [
			{
				sectionType: 'HERO',
				sortOrder: 0,
				config: { title: 'Your seat was never meant to be passive', subtitle: 'Find a team.', imageUrl: '/images/wallpaper01.jpg' }
			},
			{ sectionType: 'SERVE', sortOrder: 1, config: {} }
		]
	},
	{
		slug: '/bep-hub-landing',
		title: 'BEP Hub',
		sections: [
			{
				sectionType: 'HERO',
				sortOrder: 0,
				config: { title: 'Business & Entrepreneurs Hub', subtitle: 'Faith-rooted socio-economic empowerment.', imageUrl: '/images/image06.jpeg' }
			},
			{ sectionType: 'CUSTOM', sortOrder: 1, config: { title: 'Verified businesses' } }
		]
	},
	{
		slug: '/watch-landing',
		title: 'Watch',
		sections: [
			{
				sectionType: 'HERO',
				sortOrder: 0,
				config: { title: 'Watch & Listen', subtitle: 'Catch up on the latest messages.', imageUrl: '/images/sermon1.jpg' }
			},
			{ sectionType: 'CUSTOM', sortOrder: 1, config: { title: 'Latest sermons' } }
		]
	},
	{
		slug: '/contact-landing',
		title: 'Contact',
		sections: [
			{
				sectionType: 'HERO',
				sortOrder: 0,
				config: { title: 'We would love to hear from you', subtitle: 'Reach the team directly.', imageUrl: '/images/slider02.jpeg' }
			},
			{ sectionType: 'CONTACT', sortOrder: 1, config: { title: 'Send us a note', intro: 'We reply within 48 hours.' } }
		]
	}
];
