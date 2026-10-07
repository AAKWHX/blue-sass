import postgres from "postgres";
import { existsSync } from "node:fs";
import { protectServerTables } from "./server-table-security.mjs";
for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);
if (!process.env.DATABASE_URL) {
  console.log("No database configured: security migration skipped.");
} else {
  const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, connect_timeout: 15 });
  try {
    await sql.begin(async tx => {
      await tx`CREATE TABLE IF NOT EXISTS public.security_rate_limits (key_hash text PRIMARY KEY, hits integer NOT NULL CHECK (hits > 0), expires_at timestamptz NOT NULL)`;
      await tx`CREATE INDEX IF NOT EXISTS security_rate_limits_expiry_idx ON public.security_rate_limits (expires_at)`;
      await protectServerTables(tx, ["security_rate_limits"]);
      await tx`ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS capture_started_at timestamptz`;
      // Only unpaid, unstarted requests. Never reinterpret an existing payment.
      await tx`SELECT p.id FROM public.projects p WHERE p.client_id IS NOT NULL AND p.stage='planning' AND p.industry IN ('web','mobile','ai','ecommerce','erp','brand') FOR UPDATE OF p`;
      await tx`INSERT INTO public.project_billing (project_id)
        SELECT p.id FROM public.projects p WHERE p.client_id IS NOT NULL AND p.stage = 'planning'
        AND p.industry IN ('web','mobile','ai','ecommerce','erp','brand')
        AND NOT EXISTS (SELECT 1 FROM public.payments pay WHERE pay.project_id = p.id)
        AND NOT EXISTS (SELECT 1 FROM public.project_files f WHERE f.project_id = p.id AND f.url IN ('urn:bluesass:lifecycle:cancelled','urn:bluesass:lifecycle:design-started'))
        ON CONFLICT (project_id) DO NOTHING`;
    });
    console.log("Security schema is ready; private counters are protected.");
  } finally { await sql.end(); }
}
