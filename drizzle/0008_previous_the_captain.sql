CREATE INDEX "event_registrations_email_idx" ON "event_registrations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "payments_payer_email_idx" ON "payments" USING btree ("payer_email");