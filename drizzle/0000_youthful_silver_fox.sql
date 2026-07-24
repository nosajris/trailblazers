CREATE TYPE "public"."event_type" AS ENUM('camp', 'workshop', 'meetup', 'service');--> statement-breakpoint
CREATE TYPE "public"."group_type" AS ENUM('campus', 'professional', 'online', 'interest');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('member', 'leader', 'admin');--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"location" text NOT NULL,
	"price" integer DEFAULT 0,
	"capacity" integer,
	"image_url" text,
	"is_published" boolean DEFAULT true,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"leader_name" text NOT NULL,
	"type" text NOT NULL,
	"meeting_time" text,
	"location" text,
	"description" text,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"role" text DEFAULT 'member' NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;