CREATE TABLE "media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"variants" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"uploaded_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stat_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"day" text NOT NULL,
	"metric" text NOT NULL,
	"key" text DEFAULT '' NOT NULL,
	"label" text DEFAULT '' NOT NULL,
	"n" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stat_seen" (
	"id" serial PRIMARY KEY NOT NULL,
	"day" text NOT NULL,
	"mark" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_registrations" ADD COLUMN "reminder_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_assets_created_idx" ON "media_assets" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "stat_days_day_metric_key_idx" ON "stat_days" USING btree ("day","metric","key");--> statement-breakpoint
CREATE INDEX "stat_days_day_idx" ON "stat_days" USING btree ("day");--> statement-breakpoint
CREATE UNIQUE INDEX "stat_seen_day_mark_idx" ON "stat_seen" USING btree ("day","mark");--> statement-breakpoint
CREATE INDEX "event_registrations_reminder_idx" ON "event_registrations" USING btree ("status","reminder_sent_at");