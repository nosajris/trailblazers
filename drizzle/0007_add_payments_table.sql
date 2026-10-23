CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"purpose" text NOT NULL,
	"purpose_id" integer,
	"provider" text NOT NULL,
	"provider_reference" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"payer_name" text NOT NULL,
	"payer_email" text NOT NULL,
	"payer_phone" text,
	"method" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"raw_result" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "payments_reference_idx" ON "payments" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "payments_purpose_idx" ON "payments" USING btree ("purpose","purpose_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");