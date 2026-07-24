CREATE TYPE "public"."event_type" AS ENUM('CAMP', 'WORKSHOP', 'MEETUP');--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text,
	"summary" text NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"date" timestamp NOT NULL,
	"location" text NOT NULL,
	"image_url" text,
	"type" text NOT NULL,
	"price" integer DEFAULT 0,
	"early_bird_deadline" timestamp,
	"capacity" integer,
	"registered_count" integer DEFAULT 0,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"leader" text NOT NULL,
	"day_time" text NOT NULL,
	"type" text NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "leaders" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"image_url" text,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"content" text NOT NULL,
	"rating" integer DEFAULT 5,
	"created_at" timestamp DEFAULT now()
);
