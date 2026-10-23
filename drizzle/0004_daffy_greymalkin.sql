CREATE TABLE "form_submission_counters" (
	"key_hash" text PRIMARY KEY NOT NULL,
	"window_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"count" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX "form_submission_counters_window_idx" ON "form_submission_counters" USING btree ("window_started_at");