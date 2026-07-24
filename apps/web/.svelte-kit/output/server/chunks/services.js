import "postgres";
import { e as equipment, b as bepProfiles, a as blogs, c as events, f as faqs, g as groups, d as sessions, u as users, i as inquiries, l as leaders, n as newcomerContent, p as parentContent, h as serveContent, t as testimonials, j as pages, k as pageSections, m as siteSettings, o as sermonSeries, q as sermons, r as auditLogs, v as tasks, w as db } from "./db.js";
import { eq, asc, and, desc, or, ilike, sql, gt, gte, lt } from "drizzle-orm";
function publicMediaUrl(url) {
  if (url == null || url === "") return null;
  return url.replace(/^\/assets\//, "/images/");
}
function toBepProfileVm(row) {
  return {
    id: row.id,
    businessName: row.businessName,
    industry: row.industry,
    description: row.description,
    websiteUrl: row.websiteUrl,
    isVerified: row.isVerified ?? false
  };
}
function toEquipmentVm(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    dailyRate: row.dailyRate,
    imageUrl: publicMediaUrl(row.imageUrl),
    status: String(row.status)
  };
}
function createBepService(db2) {
  return {
    async listVerifiedProfiles() {
      const rows = await db2.select().from(bepProfiles).where(and(eq(bepProfiles.isVerified, true), eq(bepProfiles.status, "PUBLISHED"))).orderBy(asc(bepProfiles.sortOrder), asc(bepProfiles.id));
      return rows.map(toBepProfileVm);
    },
    async listAvailableEquipment() {
      const rows = await db2.select().from(equipment).where(eq(equipment.status, "AVAILABLE")).orderBy(asc(equipment.sortOrder), asc(equipment.id));
      return rows.map(toEquipmentVm);
    }
  };
}
function toBlogCard(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    summary: row.summary,
    imageUrl: publicMediaUrl(row.imageUrl),
    createdAt: row.createdAt ?? /* @__PURE__ */ new Date()
  };
}
function toBlogPost(row) {
  return {
    ...toBlogCard(row),
    content: row.content ?? ""
  };
}
function createBlogService(db2) {
  return {
    async listLatest(limit = 3) {
      const rows = await db2.select().from(blogs).where(eq(blogs.status, "PUBLISHED")).orderBy(desc(blogs.createdAt)).limit(limit);
      return rows.map(toBlogCard);
    },
    async listPublished(limit = 48) {
      const cap = Math.min(100, Math.max(1, limit));
      const rows = await db2.select().from(blogs).where(eq(blogs.status, "PUBLISHED")).orderBy(desc(blogs.createdAt)).limit(cap);
      return rows.map(toBlogCard);
    },
    async getPublishedPost(id) {
      const row = await db2.query.blogs.findFirst({
        where: and(eq(blogs.id, id), eq(blogs.status, "PUBLISHED"))
      });
      return row ? toBlogPost(row) : null;
    },
    async getById(id) {
      const row = await db2.query.blogs.findFirst({
        where: and(eq(blogs.id, id), eq(blogs.status, "PUBLISHED"))
      });
      return row ? toBlogCard(row) : null;
    }
  };
}
function toEventCard(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    location: row.location,
    imageUrl: publicMediaUrl(row.imageUrl),
    type: row.type,
    price: row.price ?? 0,
    isFeatured: row.isFeatured ?? false,
    capacity: row.capacity,
    registeredCount: row.registeredCount,
    earlyBirdDeadline: row.earlyBirdDeadline
  };
}
function buildListingWhere(filters) {
  const parts = [];
  if (filters.search) {
    parts.push(
      or(ilike(events.title, `%${filters.search}%`), ilike(events.description, `%${filters.search}%`))
    );
  }
  if (filters.type && filters.type !== "ALL") {
    parts.push(eq(events.type, filters.type));
  }
  return parts.length ? and(...parts) : void 0;
}
function listingOrderBy(sort) {
  switch (sort) {
    case "date_desc":
      return desc(events.date);
    case "title_asc":
      return asc(events.title);
    case "date_asc":
    default:
      return asc(events.date);
  }
}
function countSql() {
  return sql`cast(count(*) as int)`;
}
function publishedEventsOnly() {
  return eq(events.status, "PUBLISHED");
}
function upcomingFromNow() {
  return gt(events.date, /* @__PURE__ */ new Date());
}
function createEventService(db2) {
  async function getFeaturedOrFallback() {
    let featured = await db2.query.events.findFirst({
      where: and(eq(events.isFeatured, true), publishedEventsOnly())
    });
    if (!featured) {
      const fallback = await db2.select().from(events).where(publishedEventsOnly()).orderBy(asc(events.date)).limit(1);
      featured = fallback[0];
    }
    return featured ? toEventCard(featured) : null;
  }
  return {
    listUpcomingForHome: async (limit = 3) => {
      const rows = await db2.select().from(events).where(and(publishedEventsOnly(), upcomingFromNow())).orderBy(desc(events.isFeatured), asc(events.date)).limit(limit);
      return rows.map(toEventCard);
    },
    getById: async (id) => {
      const row = await db2.query.events.findFirst({
        where: and(eq(events.id, id), publishedEventsOnly())
      });
      return row ? toEventCard(row) : null;
    },
    getFeaturedOrFallback,
    listInMonth: async (year, month) => {
      const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const end = new Date(year, month, 1, 0, 0, 0, 0);
      return (await db2.select().from(events).where(
        and(publishedEventsOnly(), gte(events.date, start), lt(events.date, end))
      ).orderBy(asc(events.date))).map(toEventCard);
    },
    listListing: async (filters) => {
      const offset = (filters.page - 1) * filters.limit;
      const whereClause = and(buildListingWhere(filters), publishedEventsOnly());
      const orderBy = listingOrderBy(filters.sort);
      const paginatedEvents = await db2.select().from(events).where(whereClause).orderBy(orderBy).limit(filters.limit).offset(offset);
      const countResult = await db2.select({ count: countSql() }).from(events).where(whereClause);
      const totalEvents = countResult[0]?.count ?? 0;
      const totalPages = Math.ceil(totalEvents / filters.limit);
      const featuredEvent = await getFeaturedOrFallback();
      return {
        events: paginatedEvents.map(toEventCard),
        featuredEvent,
        pagination: {
          currentPage: filters.page,
          totalPages,
          totalEvents
        },
        filters: {
          search: filters.search,
          type: filters.type,
          sort: filters.sort
        }
      };
    },
    getAllEventsForAdmin: async () => {
      return db2.select().from(events).orderBy(desc(events.date));
    },
    saveEvent: async (data) => {
      if (data.id) {
        const rows2 = await db2.update(events).set(data).where(eq(events.id, data.id)).returning();
        return rows2[0];
      }
      const rows = await db2.insert(events).values({
        title: data.title,
        description: data.description || "",
        date: data.date,
        location: data.location,
        imageUrl: data.imageUrl || null,
        type: data.type || "MEETUP",
        price: data.price ?? 0,
        capacity: data.capacity ?? 100,
        isFeatured: data.isFeatured ?? false,
        status: data.status || "PUBLISHED",
        publishedAt: /* @__PURE__ */ new Date()
      }).returning();
      return rows[0];
    },
    deleteEvent: async (id) => {
      await db2.delete(events).where(eq(events.id, id));
    }
  };
}
function toFaqVm(row) {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    order: row.order ?? 0
  };
}
function createFaqService(db2) {
  return {
    async listPublished() {
      const rows = await db2.select().from(faqs).where(eq(faqs.status, "PUBLISHED")).orderBy(asc(faqs.order), asc(faqs.id));
      return rows.map(toFaqVm);
    }
  };
}
function toGroupCard(row) {
  return {
    id: row.id,
    name: row.name,
    leader: row.leader,
    dayTime: row.dayTime,
    type: row.type,
    imageUrl: publicMediaUrl(row.imageUrl),
    description: row.description
  };
}
function createGroupService(db2) {
  return {
    async listPublished() {
      const rows = await db2.select().from(groups).where(eq(groups.status, "PUBLISHED")).orderBy(asc(groups.sortOrder), asc(groups.name));
      return rows.map(toGroupCard);
    }
  };
}
function toPublicUser(row) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    role: row.role
  };
}
function createIamService(db2) {
  return {
    async getUserByEmail(email) {
      return db2.query.users.findFirst({ where: eq(users.email, email) });
    },
    async getUserById(id) {
      return db2.query.users.findFirst({ where: eq(users.id, id) });
    },
    async getPublicUserById(id) {
      const row = await db2.query.users.findFirst({ where: eq(users.id, id) });
      return row ? toPublicUser(row) : null;
    },
    async createSession(userId, sessionId, expiresAt) {
      await db2.insert(sessions).values({ id: sessionId, userId, expiresAt });
    },
    async deleteSession(sessionId) {
      await db2.delete(sessions).where(eq(sessions.id, sessionId));
    },
    async validateSession(sessionId) {
      const session = await db2.query.sessions.findFirst({
        where: and(eq(sessions.id, sessionId), gt(sessions.expiresAt, /* @__PURE__ */ new Date()))
      });
      if (!session) return null;
      const user = await db2.query.users.findFirst({ where: eq(users.id, session.userId) });
      return user ? toPublicUser(user) : null;
    }
  };
}
const Sanitizer = {
  email(val) {
    if (!val) return "";
    return val.trim().toLowerCase().replace(/\s+/g, "");
  },
  phone(val) {
    if (!val) return "";
    return val.trim().replace(/[^\d+()\s-]/g, "");
  },
  text(val) {
    if (!val) return "";
    return val.trim().replace(/<[^>]*>?/gm, "");
  }
};
const logger = {
  info(module, msg, details) {
    console.log(`[INFO] [${module}] ${msg}`, details ?? "");
  },
  warn(module, msg, details) {
    console.warn(`[WARN] [${module}] ${msg}`, details ?? "");
  },
  error(module, msg, details) {
    console.error(`[ERROR] [${module}] ${msg}`, details ?? "");
  }
};
function createInquiryService(db2) {
  return {
    async createGeneral(input) {
      const cleanEmail = Sanitizer.email(input.email);
      const cleanName = Sanitizer.text(input.name);
      const cleanMsg = Sanitizer.text(input.message);
      logger.info("INQUIRY", `Creating general inquiry for ${cleanEmail}`);
      const rows = await db2.insert(inquiries).values({
        name: cleanName,
        email: cleanEmail,
        message: cleanMsg,
        type: input.type ?? "GENERAL",
        status: "PENDING"
      }).returning();
      return rows[0];
    },
    async createInquiry(input) {
      const cleanEmail = Sanitizer.email(input.email);
      const cleanName = Sanitizer.text(input.fullName);
      const cleanMsg = Sanitizer.text(input.message);
      logger.info("INQUIRY", `Creating inquiry (${input.type || "GENERAL"}) for ${cleanEmail}`);
      const rows = await db2.insert(inquiries).values({
        name: cleanName,
        email: cleanEmail,
        message: cleanMsg,
        type: input.type ?? "GENERAL",
        status: "PENDING"
      }).returning();
      return rows[0];
    },
    async listForAdmin() {
      const rows = await db2.select().from(inquiries).orderBy(desc(inquiries.createdAt));
      return rows.map((r) => ({
        id: r.id,
        fullName: r.name,
        email: r.email,
        message: r.message || "",
        type: r.type || "GENERAL",
        status: r.status || "PENDING",
        createdAt: r.createdAt || /* @__PURE__ */ new Date()
      }));
    }
  };
}
function toLeaderVm(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    imageUrl: publicMediaUrl(row.imageUrl),
    order: row.order ?? 0
  };
}
function createLeaderService(db2) {
  return {
    async listPublished() {
      const rows = await db2.select().from(leaders).where(eq(leaders.status, "PUBLISHED")).orderBy(asc(leaders.order), asc(leaders.id));
      return rows.map(toLeaderVm);
    }
  };
}
function createNewcomerService(db2) {
  return {
    async getPrimaryPublished() {
      const rows = await db2.select().from(newcomerContent).where(eq(newcomerContent.status, "PUBLISHED")).orderBy(asc(newcomerContent.sortOrder), asc(newcomerContent.id)).limit(1);
      return rows[0] ? {
        id: rows[0].id,
        headline: rows[0].headline,
        subheadline: rows[0].subheadline,
        body: rows[0].body,
        ctaLabel: rows[0].ctaLabel,
        ctaHref: rows[0].ctaHref,
        imageUrl: publicMediaUrl(rows[0].imageUrl)
      } : null;
    }
  };
}
function createParentService(db2) {
  return {
    async getPrimaryPublished() {
      const rows = await db2.select().from(parentContent).where(eq(parentContent.status, "PUBLISHED")).orderBy(asc(parentContent.sortOrder), asc(parentContent.id)).limit(1);
      const row = rows[0];
      if (!row) return null;
      return {
        id: row.id,
        headline: row.headline,
        subheadline: row.subheadline,
        body: row.body,
        ctaLabel: row.ctaLabel,
        ctaHref: row.ctaHref,
        imageUrl: publicMediaUrl(row.imageUrl)
      };
    }
  };
}
function toRichSectionVm(row) {
  return {
    id: row.id,
    headline: row.headline,
    subheadline: row.subheadline,
    body: row.body,
    ctaLabel: row.ctaLabel,
    ctaHref: row.ctaHref,
    imageUrl: publicMediaUrl(row.imageUrl)
  };
}
function createServeService(db2) {
  return {
    async getPrimaryPublished() {
      const rows = await db2.select().from(serveContent).where(eq(serveContent.status, "PUBLISHED")).orderBy(asc(serveContent.sortOrder), asc(serveContent.id)).limit(1);
      return rows[0] ? toRichSectionVm(rows[0]) : null;
    }
  };
}
function toTestimonialVm(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    content: row.content,
    rating: row.rating ?? 5
  };
}
function createTestimonialService(db2) {
  return {
    async listPublished() {
      const rows = await db2.select().from(testimonials).where(eq(testimonials.status, "PUBLISHED")).orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
      return rows.map(toTestimonialVm);
    }
  };
}
function createSectionStrategyServices(db2) {
  return {
    events: createEventService(db2),
    blog: createBlogService(db2),
    groups: createGroupService(db2),
    testimonials: createTestimonialService(db2),
    leaders: createLeaderService(db2),
    faq: createFaqService(db2),
    serve: createServeService(db2),
    newcomers: createNewcomerService(db2),
    parents: createParentService(db2)
  };
}
function createSectionStrategyRegistry(services2) {
  const cfg = (s) => s.config ?? {};
  return {
    HERO: async (section) => {
      const c = cfg(section);
      return {
        kind: "HERO",
        data: {
          title: String(c.title ?? "Welcome"),
          subtitle: c.subtitle ? String(c.subtitle) : void 0,
          imageUrl: c.imageUrl ? String(c.imageUrl) : void 0,
          videoUrl: c.videoUrl ? String(c.videoUrl) : void 0,
          primaryCta: c.primaryCtaLabel && c.primaryCtaHref ? { label: String(c.primaryCtaLabel), href: String(c.primaryCtaHref) } : void 0,
          secondaryCta: c.secondaryCtaLabel && c.secondaryCtaHref ? { label: String(c.secondaryCtaLabel), href: String(c.secondaryCtaHref) } : void 0
        }
      };
    },
    EVENTS_RAIL: async (section) => {
      const c = cfg(section);
      const limit = Math.min(20, Math.max(1, Number(c.limit ?? 3)));
      const events2 = await services2.events.listUpcomingForHome(limit);
      return {
        kind: "EVENTS_RAIL",
        data: { title: c.title ? String(c.title) : void 0, limit, events: events2 }
      };
    },
    BLOG: async (section) => {
      const c = cfg(section);
      const limit = Math.min(20, Math.max(1, Number(c.limit ?? 3)));
      const posts = await services2.blog.listLatest(limit);
      return { kind: "BLOG", data: { title: c.title ? String(c.title) : void 0, posts } };
    },
    TESTIMONIALS: async (section) => {
      const c = cfg(section);
      const items = await services2.testimonials.listPublished();
      return { kind: "TESTIMONIALS", data: { title: c.title ? String(c.title) : void 0, items } };
    },
    GROUPS: async (section) => {
      const c = cfg(section);
      const groups2 = await services2.groups.listPublished();
      return { kind: "GROUPS", data: { title: c.title ? String(c.title) : void 0, groups: groups2 } };
    },
    SERVE: async () => {
      const data = await services2.serve.getPrimaryPublished();
      return { kind: "SERVE", data };
    },
    LEADERS: async (section) => {
      const c = cfg(section);
      const leaders2 = await services2.leaders.listPublished();
      return { kind: "LEADERS", data: { title: c.title ? String(c.title) : void 0, leaders: leaders2 } };
    },
    IM_NEW: async () => {
      const data = await services2.newcomers.getPrimaryPublished();
      return { kind: "IM_NEW", data };
    },
    PARENTS: async () => {
      const data = await services2.parents.getPrimaryPublished();
      return { kind: "PARENTS", data };
    },
    FAQ: async (section) => {
      const c = cfg(section);
      const items = await services2.faq.listPublished();
      return { kind: "FAQ", data: { title: c.title ? String(c.title) : void 0, items } };
    },
    CONTACT: async (section) => {
      const c = cfg(section);
      return {
        kind: "CONTACT",
        data: {
          title: c.title ? String(c.title) : "Contact",
          intro: c.intro ? String(c.intro) : void 0
        }
      };
    },
    CUSTOM: async (section) => {
      return { kind: "CUSTOM", data: cfg(section) };
    }
  };
}
function createPageComposerService(db2) {
  const services2 = createSectionStrategyServices(db2);
  const registry = createSectionStrategyRegistry(services2);
  return {
    async composePublicPage(slug) {
      const page = await db2.query.pages.findFirst({
        where: and(eq(pages.slug, slug), eq(pages.status, "PUBLISHED"))
      });
      if (!page) return [];
      const sections = await db2.select().from(pageSections).where(and(eq(pageSections.pageId, page.id), eq(pageSections.status, "PUBLISHED"))).orderBy(asc(pageSections.sortOrder), asc(pageSections.id));
      const blocks = [];
      for (const section of sections) {
        const loader = registry[section.sectionType];
        if (!loader) continue;
        const block = await loader(section);
        if (block) blocks.push(block);
      }
      return blocks;
    }
  };
}
const DEFAULT_EXTRAS = {
  givingUrl: "",
  planVisitHref: "/plan-a-visit",
  watchUrl: "/watch",
  watchEmbedUrl: "",
  messagesUrl: "/messages",
  campuses: [{ id: "main", label: "Gather with us", href: "/contact" }],
  languageOptions: [
    { code: "en", label: "English", href: "#" },
    { code: "es", label: "Español", href: "#" }
  ],
  organizationName: "Trailblazers Young Adults"
};
const DEFAULTS = {
  navLinks: [
    { label: "Home", href: "/" },
    {
      label: "Watch & listen",
      columns: [
        {
          title: "Media",
          links: [
            { label: "Watch", href: "/watch" },
            { label: "Messages", href: "/messages" },
            { label: "Events", href: "/events" }
          ]
        },
        {
          title: "Connect",
          links: [
            { label: "Plan a visit", href: "/plan-a-visit" },
            { label: "Contact", href: "/contact" }
          ]
        }
      ]
    },
    { label: "Stories", href: "/stories" },
    { label: "Groups", href: "/groups" },
    {
      label: "Ministries",
      columns: [
        {
          title: "Grow & serve",
          links: [
            { label: "BEP Hub", href: "/bep-hub" },
            { label: "Serve", href: "/serve" }
          ]
        },
        {
          title: "Learn",
          links: [
            { label: "FAQ", href: "/faq" }
          ]
        }
      ]
    },
    { label: "Give", href: "/give" }
  ],
  footerColumns: [
    {
      title: "Ministry",
      links: [
        { label: "Watch", href: "/watch" },
        { label: "Messages", href: "/messages" },
        { label: "Events", href: "/events" },
        { label: "Plan a visit", href: "/plan-a-visit" }
      ]
    },
    {
      title: "Community",
      links: [
        { label: "Stories", href: "/stories" },
        { label: "Groups", href: "/groups" },
        { label: "BEP Hub", href: "/bep-hub" },
        { label: "Serve", href: "/serve" }
      ]
    },
    {
      title: "Connect",
      links: [
        { label: "FAQ", href: "/faq" },
        { label: "Contact", href: "/contact" },
        { label: "Give", href: "/give" }
      ]
    }
  ],
  seoDefaults: {
    title: "Trailblazers Young Adults",
    description: "Young adults ministry — events, community, and growth."
  },
  siteExtras: DEFAULT_EXTRAS
};
function mergeExtras(raw) {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_EXTRAS };
  return { ...DEFAULT_EXTRAS, ...raw };
}
function createSettingsService(db2) {
  return {
    async getBundle() {
      const all = await db2.select().from(siteSettings);
      const map = Object.fromEntries(all.map((r) => [r.key, r.value]));
      const navLinks = map["nav_links"] ?? DEFAULTS.navLinks;
      const footerColumns = map["footer_columns"] ?? DEFAULTS.footerColumns;
      const seoDefaults = map["seo_defaults"] ?? DEFAULTS.seoDefaults;
      const siteExtras = mergeExtras(map["site_extras"]);
      return {
        navLinks,
        footerColumns,
        seoDefaults,
        siteExtras
      };
    },
    defaults: DEFAULTS
  };
}
function createSermonRepository(db2) {
  return {
    async findAll() {
      return db2.select().from(sermons).orderBy(desc(sermons.publishedAt));
    },
    async findFeatured() {
      return db2.select().from(sermons).where(eq(sermons.isFeatured, true)).orderBy(desc(sermons.publishedAt)).limit(1);
    },
    async findBySlug(slug) {
      const rows = await db2.select().from(sermons).where(eq(sermons.slug, slug)).limit(1);
      return rows[0] || null;
    },
    async findById(id) {
      const rows = await db2.select().from(sermons).where(eq(sermons.id, id)).limit(1);
      return rows[0] || null;
    },
    async create(data) {
      const rows = await db2.insert(sermons).values(data).returning();
      return rows[0];
    },
    async update(id, data) {
      const rows = await db2.update(sermons).set(data).where(eq(sermons.id, id)).returning();
      return rows[0];
    },
    async delete(id) {
      await db2.delete(sermons).where(eq(sermons.id, id));
    },
    async findAllSeries() {
      return db2.select().from(sermonSeries).orderBy(desc(sermonSeries.createdAt));
    },
    async createSeries(data) {
      const rows = await db2.insert(sermonSeries).values(data).returning();
      return rows[0];
    }
  };
}
function createSermonService(db2) {
  const repo = createSermonRepository(db2);
  return {
    async getAllSermons() {
      return repo.findAll();
    },
    async getFeaturedSermon() {
      const featured = await repo.findFeatured();
      if (featured.length > 0) return featured[0];
      const all = await repo.findAll();
      return all[0] || null;
    },
    async getSermonBySlug(slug) {
      return repo.findBySlug(slug);
    },
    async getSermonById(id) {
      return repo.findById(id);
    },
    async saveSermon(data) {
      const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      if (data.id) {
        return repo.update(data.id, { ...data, slug });
      }
      return repo.create({
        title: data.title,
        slug,
        speaker: data.speaker || "Pastor / Speaker",
        videoUrl: data.videoUrl || null,
        youtubeId: data.youtubeId || null,
        audioUrl: data.audioUrl || null,
        scripture: data.scripture || null,
        summary: data.summary || null,
        notes: data.notes || null,
        discussionGuide: data.discussionGuide || null,
        notesUrl: data.notesUrl || null,
        isLiveNow: data.isLiveNow ?? false,
        liveStreamUrl: data.liveStreamUrl || null,
        thumbnailUrl: data.thumbnailUrl || null,
        isFeatured: data.isFeatured ?? false,
        publishedAt: data.publishedAt || /* @__PURE__ */ new Date()
      });
    },
    async deleteSermon(id) {
      return repo.delete(id);
    },
    async getAllSeries() {
      return repo.findAllSeries();
    },
    async createSeries(title, description, coverImageUrl) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      return repo.createSeries({ title, slug, description, coverImageUrl });
    }
  };
}
function createAuditLogsRepository(db2) {
  return {
    async findAll(limit = 100) {
      return db2.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
    },
    async create(data) {
      const rows = await db2.insert(auditLogs).values(data).returning();
      return rows[0];
    }
  };
}
function createAuditLogsService(db2) {
  const repo = createAuditLogsRepository(db2);
  return {
    async logAction(action, entityType, entityId, details, userId, userName) {
      return repo.create({
        action,
        entityType,
        entityId: entityId || null,
        details: details || null,
        userId: userId || null,
        userName: userName || "Staff Admin"
      });
    },
    async getRecentLogs(limit = 50) {
      return repo.findAll(limit);
    }
  };
}
function createTasksRepository(db2) {
  return {
    async findAll() {
      return db2.select().from(tasks).orderBy(desc(tasks.createdAt));
    },
    async create(data) {
      const rows = await db2.insert(tasks).values(data).returning();
      return rows[0];
    },
    async updateStatus(id, isCompleted) {
      const rows = await db2.update(tasks).set({ isCompleted }).where(eq(tasks.id, id)).returning();
      return rows[0];
    }
  };
}
function createTasksService(db2) {
  const repo = createTasksRepository(db2);
  return {
    async getAllTasks() {
      return repo.findAll();
    },
    async createTask(title, description, relatedEntityType, relatedEntityId) {
      return repo.create({
        title,
        description: description || null,
        relatedEntityType: relatedEntityType || null,
        relatedEntityId: relatedEntityId || null,
        isCompleted: false,
        dueDate: new Date(Date.now() + 864e5 * 2)
        // Default due in 2 days
      });
    },
    async toggleTaskCompleted(id, isCompleted) {
      return repo.updateStatus(id, isCompleted);
    }
  };
}
function createExportService() {
  return {
    arrayToCsv(data) {
      if (!data || data.length === 0) return "";
      const headers = Object.keys(data[0]);
      const csvRows = [];
      csvRows.push(headers.join(","));
      for (const row of data) {
        const values = headers.map((header) => {
          const val = row[header];
          if (val === null || val === void 0) return '""';
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
      }
      return csvRows.join("\n");
    }
  };
}
function createEmailService() {
  return {
    async sendWelcomeEmail(toEmail, fullName) {
      logger.info("EMAIL", `Simulating sending welcome email to ${fullName} (${toEmail})`);
      return { success: true, messageId: `msg_${Date.now()}` };
    },
    async sendVolunteerConfirmation(toEmail, fullName, team) {
      logger.info("EMAIL", `Simulating sending volunteer serve confirmation to ${fullName} (${toEmail}) for team: ${team}`);
      return { success: true, messageId: `msg_${Date.now()}` };
    }
  };
}
function createCoreServices(db2) {
  return {
    iam: createIamService(db2),
    events: createEventService(db2),
    sermons: createSermonService(db2),
    blog: createBlogService(db2),
    groups: createGroupService(db2),
    testimonials: createTestimonialService(db2),
    leaders: createLeaderService(db2),
    faq: createFaqService(db2),
    inquiries: createInquiryService(db2),
    bep: createBepService(db2),
    settings: createSettingsService(db2),
    pages: createPageComposerService(db2),
    serve: createServeService(db2),
    newcomers: createNewcomerService(db2),
    parents: createParentService(db2),
    auditLogs: createAuditLogsService(db2),
    tasks: createTasksService(db2),
    export: createExportService(),
    email: createEmailService()
  };
}
const services = createCoreServices(db);
export {
  services as s
};
