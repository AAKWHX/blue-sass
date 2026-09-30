CREATE TYPE "public"."hosting_status" AS ENUM('uploading', 'building', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "hosted_sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"project_name" text NOT NULL,
	"framework" text NOT NULL,
	"deployment_id" text,
	"url" text,
	"status" "hosting_status" DEFAULT 'uploading' NOT NULL,
	"error_message" text,
	"file_count" integer DEFAULT 0 NOT NULL,
	"total_bytes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hosted_sites_project_name_unique" UNIQUE("project_name"),
	CONSTRAINT "hosted_sites_deployment_id_unique" UNIQUE("deployment_id")
);
--> statement-breakpoint
ALTER TABLE "hosted_sites" ADD CONSTRAINT "hosted_sites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hosted_sites_user_idx" ON "hosted_sites" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "hosted_sites_status_idx" ON "hosted_sites" USING btree ("status");