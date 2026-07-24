export const usersData = [
{ email: 'admin@paoz.org', passwordHash: 'hashed_secret', fullName: 'Admin User', role: 'ADMIN' as const },
{ email: 'leader@paoz.org', passwordHash: 'hashed_secret', fullName: 'Sarah Leader', role: 'LEADER' as const },
{ email: 'member@paoz.org', passwordHash: 'hashed_secret', fullName: 'John Member', role: 'MEMBER' as const },
{ email: 'entrepreneur@paoz.org', passwordHash: 'hashed_secret', fullName: 'Mike Business', role: 'MEMBER' as const },
];
export const eventsData = [
{
id: 1,
title: 'National Camp 2025: IGNITED FOR IMPACT',
description: 'Join hundreds of young adults for the most anticipated event of the year. Experience powerful worship, dynamic speakers, and build friendships that last a lifetime.',
date: new Date('2025-08-13T14:00:00'),
location: 'Resurrection Center',
imageUrl: '/images/camp.jpg',
type: 'CAMP' as const,
price: 5000,
earlyBirdDeadline: new Date('2025-06-01'),
capacity: 500,
registeredCount: 120,
isFeatured: true,
createdAt: new Date()
},
{
id: 2,
title: 'Catalyst Worship Night',
description: 'An evening of powerful worship, prayer, and community.',
date: new Date('2025-08-15T18:00:00'),
location: 'Main Auditorium',
imageUrl: '/images/wallpaper01.jpg',
type: 'MEETUP' as const,
price: 0,
capacity: 300,
registeredCount: 45,
isFeatured: false,
createdAt: new Date()
},
{
id: 3,
title: 'Amplify Leadership Conference',
description: 'A weekend dedicated to equipping you for influence in the marketplace and beyond.',
date: new Date('2025-10-10T09:00:00'),
location: 'Conference Hall',
imageUrl: '/images/wallpaper05.jpeg',
type: 'WORKSHOP' as const,
price: 1500,
capacity: 150,
registeredCount: 10,
isFeatured: false,
createdAt: new Date()
}
];
export const blogsData = [
{
id: 1,
title: '5 Takeaways From Our Winter Conference',
category: 'EVENT RECAP',
summary: 'It was a powerful weekend of growth and connection.',
content: 'Full article content goes here...',
imageUrl: '/images/slider03.jpeg',
authorId: 1, // Placeholder ID
createdAt: new Date()
},
{
id: 2,
title: 'How to Lead When You Dont Feel Ready',
category: 'LEADERSHIP INSIGHTS',
summary: 'A few thoughts on stepping into your calling.',
content: 'Full article content goes here...',
imageUrl: '/images/image01.jpeg',
authorId: 2, // Placeholder ID
createdAt: new Date()
}
];
export const groupsData = [
{ id: 1, name: 'Campus Connect (UoH)', type: 'CAMPUS' as const, leader: 'David & Sarah', dayTime: 'Tuesdays @ 7PM', imageUrl: '/images/wallpaper04.jpg', description: 'For UoH students.' },
{ id: 2, name: 'Marketplace Movers', type: 'PRO' as const, leader: 'Michael B.', dayTime: 'Thursdays @ 6AM', imageUrl: '/images/image06.jpeg', description: 'For young professionals.' },
{ id: 3, name: 'Downtown Creatives', type: 'INTEREST' as const, leader: 'Jane Smith', dayTime: 'Wednesdays @ 6PM', imageUrl: '/images/wallpaper06.jpg', description: 'For artists and musicians.' },
];
export const bepData = [
{ id: 1, userId: 4, businessName: 'Pixel Perfect Design', industry: 'Creative Services', description: 'Graphic design and branding for startups.', websiteUrl: 'https://example.com', isVerified: true }
];
export const equipmentData = [
{ id: 1, name: 'Sony A7III Camera Kit', description: 'Includes 24-70mm lens and 2 batteries.', dailyRate: 2500, status: 'AVAILABLE' as const, imageUrl: '/images/sermon1.jpg' },
{ id: 2, name: 'DJI Ronin S Gimbal', description: 'Professional 3-axis stabilizer.', dailyRate: 1500, status: 'AVAILABLE' as const, imageUrl: '/images/sermon2.jpg' }
];
export const testimonialsData = [
{ id: 1, name: "Robin Ayala Doe", role: "Catalyst Inc.", rating: 5, content: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia." },
{ id: 2, name: "Sarah Johnson", role: "Amplify Conference", rating: 5, content: "The community has been exceptional." }
];
export const leadersData = [
{ id: 1, name: "Bishop N Muparutsa", role: "Presiding Bishop", imageUrl: "/images/presiding.jpg", order: 1 },
{ id: 2, name: "Rev W Machingura", role: "National Young Adults Director", imageUrl: "/images/RevWashie.jpg", order: 2 },
];
export const faqsData = [
{ id: 1, question: "Who is the Young Adults Ministry for?", answer: "Our ministry is for all young adults, typically from post-high school through their early 30s.", order: 1 },
{ id: 2, question: "What is the BEP Hub?", answer: "The Business & Entrepreneurs Hub (BEP) is our dedicated initiative for socio-economic empowerment.", order: 2 },
];