ALTER TYPE "public"."user_role" ADD VALUE 'SECRETARY';
--> statement-breakpoint
CREATE TYPE "public"."page_section_type" AS ENUM('HERO', 'EVENTS_RAIL', 'BLOG', 'TESTIMONIALS', 'GROUPS', 'SERVE', 'LEADERS', 'IM_NEW', 'PARENTS', 'FAQ', 'CONTACT', 'CUSTOM');
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "page_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_id" integer NOT NULL,
	"section_type" "page_section_type" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ref_id" integer,
	CONSTRAINT "page_sections_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
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
ALTER TABLE "events" ADD COLUMN "status" text DEFAULT 'PUBLISHED' NOT NULL;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "sort_order" integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "published_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "status" text DEFAULT 'PUBLISHED' NOT NULL;
--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "sort_order" integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "published_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "status" text DEFAULT 'PUBLISHED' NOT NULL;
--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "sort_order" integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "is_featured" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "status" text DEFAULT 'PUBLISHED' NOT NULL;
--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "sort_order" integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "leaders" ADD COLUMN "status" text DEFAULT 'PUBLISHED' NOT NULL;
--> statement-breakpoint
ALTER TABLE "faqs" ADD COLUMN "status" text DEFAULT 'PUBLISHED' NOT NULL;
--> statement-breakpoint
ALTER TABLE "bep_profiles" ADD COLUMN "status" text DEFAULT 'PUBLISHED' NOT NULL;
--> statement-breakpoint
ALTER TABLE "bep_profiles" ADD COLUMN "sort_order" integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "equipment" ADD COLUMN "sort_order" integer DEFAULT 0;
