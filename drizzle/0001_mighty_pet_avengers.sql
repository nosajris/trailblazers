CREATE TABLE "password_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"purpose" text DEFAULT 'INVITE' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "password_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"status" text DEFAULT 'CONFIRMED' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_interests" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text,
	"status" text DEFAULT 'NEW' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"consented_at" timestamp with time zone,
	"consent_source" text,
	"consent_text" text,
	"unsubscribe_token_hash" text NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email"),
	CONSTRAINT "newsletter_subscribers_unsubscribe_token_hash_unique" UNIQUE("unsubscribe_token_hash")
);
--> statement-breakpoint
CREATE TABLE "prayer_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text,
	"email" text,
	"phone" text,
	"request" text NOT NULL,
	"is_private" boolean DEFAULT true NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"shared_publicly" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'NEW' NOT NULL,
	"staff_notes" text,
	"assigned_to_user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "password_tokens" ADD CONSTRAINT "password_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_interests" ADD CONSTRAINT "group_interests_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_requests" ADD CONSTRAINT "prayer_requests_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "password_tokens_user_id_idx" ON "password_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "password_tokens_expires_at_idx" ON "password_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "event_registrations_event_email_idx" ON "event_registrations" USING btree ("event_id","email");--> statement-breakpoint
CREATE INDEX "event_registrations_event_status_idx" ON "event_registrations" USING btree ("event_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "group_interests_group_email_idx" ON "group_interests" USING btree ("group_id","email");--> statement-breakpoint
CREATE INDEX "group_interests_status_created_idx" ON "group_interests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "newsletter_subscribers_unsubscribed_idx" ON "newsletter_subscribers" USING btree ("unsubscribed_at");--> statement-breakpoint
CREATE INDEX "prayer_requests_status_created_idx" ON "prayer_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "prayer_requests_assigned_idx" ON "prayer_requests" USING btree ("assigned_to_user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "events_status_date_idx" ON "events" USING btree ("status","date");--> statement-breakpoint
CREATE INDEX "events_status_featured_idx" ON "events" USING btree ("status","is_featured");--> statement-breakpoint
CREATE INDEX "blogs_status_created_at_idx" ON "blogs" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "blogs_author_id_idx" ON "blogs" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "groups_status_sort_idx" ON "groups" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "testimonials_status_sort_idx" ON "testimonials" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "leaders_status_order_idx" ON "leaders" USING btree ("status","order");--> statement-breakpoint
CREATE INDEX "faqs_status_order_idx" ON "faqs" USING btree ("status","order");--> statement-breakpoint
CREATE INDEX "inquiries_status_created_at_idx" ON "inquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "bep_profiles_user_id_idx" ON "bep_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bep_profiles_verified_status_idx" ON "bep_profiles" USING btree ("is_verified","status");--> statement-breakpoint
CREATE INDEX "equipment_status_sort_idx" ON "equipment" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "statistics_district_date_idx" ON "statistics" USING btree ("district_name","date");--> statement-breakpoint
CREATE INDEX "statistics_submitted_by_idx" ON "statistics" USING btree ("submitted_by");--> statement-breakpoint
CREATE INDEX "page_sections_page_status_sort_idx" ON "page_sections" USING btree ("page_id","status","sort_order");--> statement-breakpoint
CREATE INDEX "serve_content_status_sort_idx" ON "serve_content" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "newcomer_content_status_sort_idx" ON "newcomer_content" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "parent_content_status_sort_idx" ON "parent_content" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "sermons_published_at_idx" ON "sermons" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "sermons_featured_published_idx" ON "sermons" USING btree ("is_featured","published_at");--> statement-breakpoint
CREATE INDEX "sermons_series_id_idx" ON "sermons" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tasks_created_at_idx" ON "tasks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tasks_assigned_to_user_id_idx" ON "tasks" USING btree ("assigned_to_user_id");