// ### FILE: src/lib/server/db/schema.ts ###
import { pgTable, serial, text, timestamp, boolean, integer, pgEnum, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- ENUMS ---
export const eventTypeEnum = pgEnum('event_type', ['CAMP', 'WORKSHOP', 'MEETUP']);
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'LEADER', 'MEMBER']);
export const groupTypeEnum = pgEnum('group_type', ['CAMPUS', 'PRO', 'INTEREST', 'ONLINE']);
export const equipmentStatusEnum = pgEnum('equipment_status', ['AVAILABLE', 'RENTED', 'MAINTENANCE']);

// --- CORE TABLES ---

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  role: userRoleEnum('role').default('MEMBER'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  date: timestamp('date').notNull(),
  location: text('location').notNull(),
  imageUrl: text('image_url'),
  type: eventTypeEnum('type').notNull(),
  price: integer('price').default(0),
  earlyBirdDeadline: timestamp('early_bird_deadline'),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const blogs = pgTable('blogs', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category'),
  summary: text('summary').notNull(),
  content: text('content'),
  imageUrl: text('image_url'),
  authorId: integer('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  leader_name: text('leader_name').notNull(),
  meetingTime: text('meeting_time').notNull(),
  type: groupTypeEnum('type').notNull(), 
  imageUrl: text('image_url'),
  description: text('description'),
});

export const testimonials = pgTable('testimonials', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    role: text('role'),
    content: text('content').notNull(),
    rating: integer('rating').default(5),
    createdAt: timestamp('created_at').defaultNow(),
});

export const leaders = pgTable('leaders', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    role: text('role').notNull(),
    imageUrl: text('image_url'),
    order: integer('order').default(0),
});

export const faqs = pgTable('faqs', {
    id: serial('id').primaryKey(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    order: integer('order').default(0),
});

export const bepProfiles = pgTable('bep_profiles', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    businessName: text('business_name').notNull(),
    industry: text('industry').notNull(),
    description: text('description').notNull(),
    websiteUrl: text('website_url'),
    isVerified: boolean('is_verified').default(false),
});

export const equipment = pgTable('equipment', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    status: equipmentStatusEnum('status').default('AVAILABLE'),
    dailyRate: integer('daily_rate').notNull(),
    imageUrl: text('image_url'),
});

export const statistics = pgTable('statistics', {
    id: serial('id').primaryKey(),
    districtName: text('district_name').notNull(),
    date: date('date').notNull(),
    attendanceCount: integer('attendance_count').default(0),
    salvationsCount: integer('salvations_count').default(0),
    notes: text('notes'),
    submittedBy: integer('submitted_by').references(() => users.id),
});

export const inquiries = pgTable('inquiries', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    message: text('message'),
    type: text('type').default('GENERAL'),
    status: text('status').default('PENDING'),
    createdAt: timestamp('created_at').defaultNow(),
});

// --- RELATIONS ---
export const usersRelations = relations(users, ({ one, many }) => ({
	bepProfile: one(bepProfiles, {
		fields: [users.id],
		references: [bepProfiles.userId],
	}),
    blogs: many(blogs),
}));

export const blogsRelations = relations(blogs, ({ one }) => ({
	author: one(users, {
		fields: [blogs.authorId],
		references: [users.id],
	}),
}));