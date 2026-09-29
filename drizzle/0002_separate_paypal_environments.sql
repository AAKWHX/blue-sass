ALTER TABLE "payments" DROP CONSTRAINT "payments_project_id_unique";--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "environment" text DEFAULT 'sandbox' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "payments_project_environment_unique" ON "payments" USING btree ("project_id","environment");