import postgres from "postgres";

if (process.env.APPLY_HOSTING_MIGRATION !== "1") {
  console.log("Hosting migration is disabled; skipping.");
  process.exit(0);
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("APPLY_HOSTING_MIGRATION is enabled but DATABASE_URL is missing.");
}

const sql = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  idle_timeout: 10,
  connect_timeout: 15,
});

try {
  await sql.begin(async (transaction) => {
    await transaction.unsafe(`
      DO $$
      BEGIN
        CREATE TYPE "public"."hosting_status" AS ENUM ('uploading', 'building', 'ready', 'failed');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END
      $$;
    `);

    await transaction.unsafe(`
      CREATE TABLE IF NOT EXISTS "public"."hosted_sites" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL,
        "name" text NOT NULL,
        "project_name" text NOT NULL,
        "framework" text NOT NULL,
        "deployment_id" text,
        "url" text,
        "status" "public"."hosting_status" DEFAULT 'uploading' NOT NULL,
        "error_message" text,
        "file_count" integer DEFAULT 0 NOT NULL,
        "total_bytes" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "hosted_sites_project_name_unique" UNIQUE ("project_name"),
        CONSTRAINT "hosted_sites_deployment_id_unique" UNIQUE ("deployment_id"),
        CONSTRAINT "hosted_sites_user_id_users_id_fk"
          FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `);

    await transaction.unsafe(`
      CREATE INDEX IF NOT EXISTS "hosted_sites_user_idx"
      ON "public"."hosted_sites" USING btree ("user_id", "created_at");
    `);

    await transaction.unsafe(`
      CREATE INDEX IF NOT EXISTS "hosted_sites_status_idx"
      ON "public"."hosted_sites" USING btree ("status");
    `);

    await transaction.unsafe(`
      ALTER TABLE "public"."users"
      ADD COLUMN IF NOT EXISTS "marketing_opt_in" boolean DEFAULT false NOT NULL;
    `);

    await transaction.unsafe(`
      DO $$
      BEGIN
        CREATE TYPE "public"."review_status" AS ENUM ('pending', 'approved', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END
      $$;
    `);

    await transaction.unsafe(`
      CREATE TABLE IF NOT EXISTS "public"."reviews" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
        "display_name" text NOT NULL,
        "company" text,
        "rating" integer NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
        "body" text NOT NULL,
        "status" "public"."review_status" DEFAULT 'pending' NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "moderated_at" timestamp with time zone
      );
    `);

    await transaction.unsafe(`CREATE INDEX IF NOT EXISTS "reviews_status_created_idx" ON "public"."reviews" USING btree ("status", "created_at");`);
    await transaction.unsafe(`CREATE INDEX IF NOT EXISTS "reviews_user_idx" ON "public"."reviews" USING btree ("user_id", "created_at");`);
  });

  console.log("Hosting and customer-experience database migration completed successfully.");
} finally {
  await sql.end({ timeout: 5 });
}
