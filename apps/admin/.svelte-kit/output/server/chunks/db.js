import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations } from "drizzle-orm";
import { pgEnum, pgTable, timestamp, text, serial, integer, boolean, date, jsonb } from "drizzle-orm/pg-core";
const userRoleEnum = pgEnum("user_role", ["ADMIN", "SECRETARY", "LEADER", "MEMBER"]);
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").default("MEMBER"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull()
});
const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] })
}));
const eventTypeEnum = pgEnum("event_type", ["CAMP", "WORKSHOP", "MEETUP"]);
const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  type: eventTypeEnum("type").notNull(),
  price: integer("price").default(0),
  earlyBirdDeadline: timestamp("early_bird_deadline", { withTimezone: true }),
  capacity: integer("capacity"),
  registeredCount: integer("registered_count").default(0),
  isFeatured: boolean("is_featured").default(false),
  status: text("status").notNull().default("PUBLISHED"),
  sortOrder: integer("sort_order").default(0),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
const blogs = pgTable("blogs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category"),
  summary: text("summary").notNull(),
  content: text("content"),
  imageUrl: text("image_url"),
  authorId: integer("author_id").references(() => users.id),
  status: text("status").notNull().default("PUBLISHED"),
  sortOrder: integer("sort_order").default(0),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
const blogsRelations = relations(blogs, ({ one }) => ({
  author: one(users, { fields: [blogs.authorId], references: [users.id] })
}));
const groupTypeEnum = pgEnum("group_type", ["CAMPUS", "PRO", "INTEREST", "ONLINE"]);
const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  leader: text("leader").notNull(),
  dayTime: text("day_time").notNull(),
  type: groupTypeEnum("type").notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  status: text("status").notNull().default("PUBLISHED"),
  sortOrder: integer("sort_order").default(0)
});
const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role"),
  content: text("content").notNull(),
  rating: integer("rating").default(5),
  isFeatured: boolean("is_featured").default(false),
  status: text("status").notNull().default("PUBLISHED"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
const leaders = pgTable("leaders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  imageUrl: text("image_url"),
  order: integer("order").default(0),
  status: text("status").notNull().default("PUBLISHED")
});
const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("order").default(0),
  status: text("status").notNull().default("PUBLISHED")
});
const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message"),
  type: text("type").default("GENERAL"),
  status: text("status").default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
const bepProfiles = pgTable("bep_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  businessName: text("business_name").notNull(),
  industry: text("industry").notNull(),
  description: text("description").notNull(),
  websiteUrl: text("website_url"),
  isVerified: boolean("is_verified").default(false),
  status: text("status").notNull().default("PUBLISHED"),
  sortOrder: integer("sort_order").default(0)
});
const bepProfilesRelations = relations(bepProfiles, ({ one }) => ({
  user: one(users, { fields: [bepProfiles.userId], references: [users.id] })
}));
const equipmentStatusEnum = pgEnum("equipment_status", ["AVAILABLE", "RENTED", "MAINTENANCE"]);
const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: equipmentStatusEnum("status").default("AVAILABLE"),
  dailyRate: integer("daily_rate").notNull(),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0)
});
const statistics = pgTable("statistics", {
  id: serial("id").primaryKey(),
  districtName: text("district_name").notNull(),
  date: date("date").notNull(),
  attendanceCount: integer("attendance_count").default(0),
  salvationsCount: integer("salvations_count").default(0),
  notes: text("notes"),
  submittedBy: integer("submitted_by").references(() => users.id)
});
const statisticsRelations = relations(statistics, ({ one }) => ({
  submitter: one(users, { fields: [statistics.submittedBy], references: [users.id] })
}));
const pageSectionTypeEnum = pgEnum("page_section_type", [
  "HERO",
  "EVENTS_RAIL",
  "BLOG",
  "TESTIMONIALS",
  "GROUPS",
  "SERVE",
  "LEADERS",
  "IM_NEW",
  "PARENTS",
  "FAQ",
  "CONTACT",
  "CUSTOM"
]);
const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  status: text("status").notNull().default("PUBLISHED")
});
const pageSections = pgTable("page_sections", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id").references(() => pages.id, { onDelete: "cascade" }).notNull(),
  sectionType: pageSectionTypeEnum("section_type").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  status: text("status").notNull().default("PUBLISHED"),
  config: jsonb("config").$type().notNull().default({}),
  refId: integer("ref_id")
});
const pagesRelations = relations(pages, ({ many }) => ({
  sections: many(pageSections)
}));
const pageSectionsRelations = relations(pageSections, ({ one }) => ({
  page: one(pages, { fields: [pageSections.pageId], references: [pages.id] })
}));
const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type().notNull()
});
const serveContent = pgTable("serve_content", {
  id: serial("id").primaryKey(),
  headline: text("headline").notNull(),
  subheadline: text("subheadline"),
  body: text("body"),
  ctaLabel: text("cta_label"),
  ctaHref: text("cta_href"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0),
  status: text("status").notNull().default("PUBLISHED"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});
const newcomerContent = pgTable("newcomer_content", {
  id: serial("id").primaryKey(),
  headline: text("headline").notNull(),
  subheadline: text("subheadline"),
  body: text("body"),
  ctaLabel: text("cta_label"),
  ctaHref: text("cta_href"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0),
  status: text("status").notNull().default("PUBLISHED"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});
const parentContent = pgTable("parent_content", {
  id: serial("id").primaryKey(),
  headline: text("headline").notNull(),
  subheadline: text("subheadline"),
  body: text("body"),
  ctaLabel: text("cta_label"),
  ctaHref: text("cta_href"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0),
  status: text("status").notNull().default("PUBLISHED"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});
const sermonSeries = pgTable("sermon_series", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
const sermons = pgTable("sermons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  speaker: text("speaker").notNull().default("Pastor / Speaker"),
  seriesId: integer("series_id").references(() => sermonSeries.id, { onDelete: "set null" }),
  videoUrl: text("video_url"),
  youtubeId: text("youtube_id"),
  audioUrl: text("audio_url"),
  scripture: text("scripture"),
  summary: text("summary"),
  notes: text("notes"),
  discussionGuide: text("discussion_guide"),
  notesUrl: text("notes_url"),
  isLiveNow: boolean("is_live_now").default(false).notNull(),
  liveStreamUrl: text("live_stream_url"),
  thumbnailUrl: text("thumbnail_url"),
  isFeatured: boolean("is_featured").default(false).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  userName: text("user_name").notNull().default("System / Staff"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  assignedToUserId: integer("assigned_to_user_id").references(() => users.id, { onDelete: "set null" }),
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: text("related_entity_id"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
const usersRelations = relations(users, ({ one, many }) => ({
  sessions: many(sessions),
  blogs: many(blogs),
  bepProfile: one(bepProfiles, {
    fields: [users.id],
    references: [bepProfiles.userId]
  })
}));
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  auditLogs,
  bepProfiles,
  bepProfilesRelations,
  blogs,
  blogsRelations,
  equipment,
  equipmentStatusEnum,
  eventTypeEnum,
  events,
  faqs,
  groupTypeEnum,
  groups,
  inquiries,
  leaders,
  newcomerContent,
  pageSectionTypeEnum,
  pageSections,
  pageSectionsRelations,
  pages,
  pagesRelations,
  parentContent,
  sermonSeries,
  sermons,
  serveContent,
  sessions,
  sessionsRelations,
  siteSettings,
  statistics,
  statisticsRelations,
  tasks,
  testimonials,
  userRoleEnum,
  users,
  usersRelations
}, Symbol.toStringTag, { value: "Module" }));
function createDatabase(databaseUrl2) {
  const sql2 = postgres(databaseUrl2, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10
  });
  const db2 = drizzle(sql2, { schema });
  return { db: db2, sql: sql2 };
}
const databaseUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/trailblazers";
const { db, sql } = createDatabase(databaseUrl);
export {
  blogs as a,
  bepProfiles as b,
  events as c,
  sessions as d,
  equipment as e,
  faqs as f,
  groups as g,
  serveContent as h,
  inquiries as i,
  pages as j,
  pageSections as k,
  leaders as l,
  siteSettings as m,
  newcomerContent as n,
  sermonSeries as o,
  parentContent as p,
  sermons as q,
  auditLogs as r,
  sql as s,
  testimonials as t,
  users as u,
  tasks as v,
  db as w
};
