ALTER TABLE "page_sections" ADD COLUMN "draft_config" jsonb;--> statement-breakpoint
ALTER TABLE "page_sections" ADD COLUMN "draft_sort_order" integer;--> statement-breakpoint
ALTER TABLE "page_sections" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "page_sections" ADD COLUMN "pending_delete" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "publish_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
-- Backfill: every section that existed before the draft model predates it, so
-- it has already been published whatever its status says. Without this, each
-- one would be reported as an addition waiting to be published, deleting one
-- would drop it from the public page immediately instead of marking it for the
-- next publish, and the first publish of a page would turn on a section staff
-- had deliberately unpublished.
UPDATE "page_sections" SET "published_at" = now() WHERE "published_at" IS NULL;--> statement-breakpoint
UPDATE "pages" SET "published_at" = now() WHERE "status" = 'PUBLISHED' AND "published_at" IS NULL;
