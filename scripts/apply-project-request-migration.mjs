import postgres from "postgres";
import { protectServerTables } from "./server-table-security.mjs";
import { existsSync } from "node:fs";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}
if (!process.env.DATABASE_URL) {
  console.log("No database configured: project request migration skipped.");
} else {
  const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, connect_timeout: 15 });
  try {
    await sql.begin(async tx => {
    await tx`CREATE TABLE IF NOT EXISTS public.project_requests (
      project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
      lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
      configuration jsonb NOT NULL,
      estimate jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )`;
    await protectServerTables(tx, ["project_requests"]);
    });
    console.log("Structured project request storage ready.");
    await sql.begin(async tx => {
      await tx`CREATE TABLE IF NOT EXISTS public.project_billing (
        project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
        approved_total_cents integer CHECK (approved_total_cents > 0),
        approved_by uuid REFERENCES public.users(id) ON DELETE RESTRICT,
        approved_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await tx`ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS billing_stage text NOT NULL DEFAULT 'legacy'`;
      await tx`CREATE UNIQUE INDEX IF NOT EXISTS payments_project_environment_stage_unique ON public.payments(project_id, environment, billing_stage)`;
      await tx`DROP INDEX IF EXISTS public.payments_project_environment_unique`;
      await protectServerTables(tx, ["project_billing"]);
    });
    console.log("Stage billing storage ready; existing payments retained as legacy.");
  } finally { await sql.end({ timeout: 5 }); }
}
