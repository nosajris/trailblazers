import { db } from '$lib/server/db';
import { events, blogs, groups, testimonials, leaders, faqs } from '$lib/server/db/schema';
import { desc, asc, gt } from 'drizzle-orm';

export const load = async () => {
  // Fetch top 3 upcoming events
  const upcomingEvents = await db.select()
    .from(events)
    .where(gt(events.date, new Date()))
    .orderBy(desc(events.isFeatured), asc(events.date))
    .limit(3);

  // Fetch latest 3 blogs
  const latestBlogs = await db.select()
    .from(blogs)
    .orderBy(desc(blogs.createdAt))
    .limit(3);

  // Fetch all groups
  const allGroups = await db.select().from(groups);

  // Fetch testimonials
  const allTestimonials = await db.select().from(testimonials);

  // Fetch leadership
  const leadership = await db.select()
    .from(leaders)
    .orderBy(asc(leaders.order));

  // Fetch FAQs
  const faqList = await db.select()
    .from(faqs)
    .orderBy(asc(faqs.order));

  return {
     upcomingEvents,
     latestBlogs,
     allGroups,
     allTestimonials,
     leadership,
     faqList
   };
};