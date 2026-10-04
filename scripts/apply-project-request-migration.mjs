import postgres from "postgres";
import { existsSync } from "node:fs";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}
if (!process.env.DATABASE_URL) {
  console.log("No database configured: project request migration skipped.");
} else {
  const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, connect_timeout: 15 });
  try {
    await sql`CREATE TABLE IF NOT EXISTS public.project_requests (
      project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
      lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
      configuration jsonb NOT NULL,
      estimate jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )`;
    console.log("Structured project request storage ready.");
  } finally { await sql.end({ timeout: 5 }); }
}
