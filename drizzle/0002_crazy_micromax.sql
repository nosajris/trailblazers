CREATE TYPE "public"."equipment_status" AS ENUM('AVAILABLE', 'RENTED', 'MAINTENANCE');--> statement-breakpoint
CREATE TYPE "public"."group_type" AS ENUM('CAMPUS', 'PRO', 'INTEREST', 'ONLINE');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'LEADER', 'MEMBER');--> statement-breakpoint
CREATE TABLE "bep_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"business_name" text NOT NULL,
	"industry" text NOT NULL,
	"description" text NOT NULL,
	"website_url" text,
	"is_verified" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "equipment_status" DEFAULT 'AVAILABLE',
	"daily_rate" integer NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text,
	"type" text DEFAULT 'GENERAL',
	"status" text DEFAULT 'PENDING',
	"created_at" timestamp DEFAULT now()
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
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text NOT NULL,
	"role" "user_role" DEFAULT 'MEMBER',
	"avatar_url" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "groups" ALTER COLUMN "type" SET DATA TYPE "public"."group_type" USING "type"::"public"."group_type";--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "author_id" integer;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "bep_profiles" ADD CONSTRAINT "bep_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statistics" ADD CONSTRAINT "statistics_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;