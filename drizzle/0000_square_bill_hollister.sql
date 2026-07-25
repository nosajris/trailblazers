CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'SECRETARY', 'LEADER', 'MEMBER');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('CAMP', 'WORKSHOP', 'MEETUP');--> statement-breakpoint
CREATE TYPE "public"."group_type" AS ENUM('CAMPUS', 'PRO', 'INTEREST', 'ONLINE');--> statement-breakpoint
CREATE TYPE "public"."equipment_status" AS ENUM('AVAILABLE', 'RENTED', 'MAINTENANCE');--> statement-breakpoint
CREATE TYPE "public"."page_section_type" AS ENUM('HERO', 'EVENTS_RAIL', 'BLOG', 'TESTIMONIALS', 'GROUPS', 'SERVE', 'LEADERS', 'IM_NEW', 'PARENTS', 'FAQ', 'CONTACT', 'CUSTOM');--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text NOT NULL,
	"role" "user_role" DEFAULT 'MEMBER',
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"location" text NOT NULL,
	"image_url" text,
	"type" "event_type" NOT NULL,
	"price" integer DEFAULT 0,
	"early_bird_deadline" timestamp with time zone,
	"capacity" integer,
	"registered_count" integer DEFAULT 0,
	"is_featured" boolean DEFAULT false,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"sort_order" integer DEFAULT 0,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text,
	"summary" text NOT NULL,
	"content" text,
	"image_url" text,
	"author_id" integer,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"sort_order" integer DEFAULT 0,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"leader" text NOT NULL,
	"day_time" text NOT NULL,
	"type" "group_type" NOT NULL,
	"image_url" text,
	"description" text,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"content" text NOT NULL,
	"rating" integer DEFAULT 5,
	"is_featured" boolean DEFAULT false,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leaders" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"image_url" text,
	"order" integer DEFAULT 0,
	"status" text DEFAULT 'PUBLISHED' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"order" integer DEFAULT 0,
	"status" text DEFAULT 'PUBLISHED' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text,
	"type" text DEFAULT 'GENERAL',
	"status" text DEFAULT 'PENDING',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bep_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"business_name" text NOT NULL,
	"industry" text NOT NULL,
	"description" text NOT NULL,
	"website_url" text,
	"is_verified" boolean DEFAULT false,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "equipment_status" DEFAULT 'AVAILABLE',
	"daily_rate" integer NOT NULL,
	"image_url" text,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"district_name" text NOT NULL,
	"date" date NOT NULL,
	"attendance_count" integer DEFAULT 0,
	"salvations_count" integer DEFAULT 0,
	"notes" text,
	"submitted_by" integer
);
--> statement-breakpoint
CREATE TABLE "page_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_id" integer NOT NULL,
	"section_type" "page_section_type" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ref_id" integer
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "serve_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"headline" text NOT NULL,
	"subheadline" text,
	"body" text,
	"cta_label" text,
	"cta_href" text,
	"image_url" text,
	"sort_order" integer DEFAULT 0,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "newcomer_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"headline" text NOT NULL,
	"subheadline" text,
	"body" text,
	"cta_label" text,
	"cta_href" text,
	"image_url" text,
	"sort_order" integer DEFAULT 0,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parent_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"headline" text NOT NULL,
	"subheadline" text,
	"body" text,
	"cta_label" text,
	"cta_href" text,
	"image_url" text,
	"sort_order" integer DEFAULT 0,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sermon_series" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"cover_image_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "sermon_series_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sermons" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"speaker" text DEFAULT 'Pastor / Speaker' NOT NULL,
	"series_id" integer,
	"video_url" text,
	"youtube_id" text,
	"audio_url" text,
	"scripture" text,
	"summary" text,
	"notes" text,
	"discussion_guide" text,
	"notes_url" text,
	"is_live_now" boolean DEFAULT false NOT NULL,
	"live_stream_url" text,
	"thumbnail_url" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "sermons_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"user_name" text DEFAULT 'System / Staff' NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"assigned_to_user_id" integer,
	"related_entity_type" text,
	"related_entity_id" text,
	"is_completed" boolean DEFAULT false NOT NULL,
	"due_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bep_profiles" ADD CONSTRAINT "bep_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statistics" ADD CONSTRAINT "statistics_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sermons" ADD CONSTRAINT "sermons_series_id_sermon_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."sermon_series"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;