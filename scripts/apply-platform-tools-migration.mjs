import postgres from "postgres";
import { existsSync } from "node:fs";
for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);
if (!process.env.DATABASE_URL) {
  console.log("No database configured: platform tools migration skipped.");
} else {
  const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, connect_timeout: 15 });
  try {
    await sql.begin(async tx => {
      await tx`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS disabled_at timestamptz`;
      await tx`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS access_version integer NOT NULL DEFAULT 0`;
      await tx`CREATE TABLE IF NOT EXISTS public.platform_owner (slot integer PRIMARY KEY DEFAULT 1 CHECK (slot = 1), user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE RESTRICT)`;
      // Owner identity is a server setting, never a client field or source-code credential.
      const ownerEmail = process.env.PLATFORM_OWNER_EMAIL?.trim().toLowerCase();
      if (ownerEmail) await tx`INSERT INTO public.platform_owner (slot, user_id) SELECT 1, u.id FROM public.users u WHERE lower(u.email) = ${ownerEmail} AND u.disabled_at IS NULL AND (u.email_verified IS NOT NULL OR EXISTS (SELECT 1 FROM public.accounts a WHERE a.user_id = u.id AND a.provider = 'google')) ON CONFLICT (slot) DO NOTHING`;
      const [owner] = await tx`SELECT user_id FROM public.platform_owner WHERE slot = 1`;
      if (!owner) throw new Error("Verified designated owner account was not found; refusing to deploy permission changes.");
      await tx`CREATE TABLE IF NOT EXISTS public.staff_access (user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE, permissions jsonb NOT NULL DEFAULT '[]', updated_by uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT, updated_at timestamptz NOT NULL DEFAULT now())`;
      await tx`CREATE TABLE IF NOT EXISTS public.staff_invitations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL, token_hash text NOT NULL UNIQUE, permissions jsonb NOT NULL, created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT, expires_at timestamptz NOT NULL, accepted_at timestamptz, revoked_at timestamptz, created_at timestamptz NOT NULL DEFAULT now())`;
      await tx`CREATE INDEX IF NOT EXISTS staff_invitations_email_idx ON public.staff_invitations(email)`;
      await tx`CREATE TABLE IF NOT EXISTS public.admin_audit (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT, target_id uuid, action text NOT NULL, details jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now())`;
      await tx`CREATE INDEX IF NOT EXISTS admin_audit_created_idx ON public.admin_audit(created_at)`;
      await tx`CREATE TABLE IF NOT EXISTS public.subscription_orders (project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 2, plan_id text NOT NULL, snapshot jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`;
      await tx`CREATE TABLE IF NOT EXISTS public.site_audits (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, source text NOT NULL, target text NOT NULL, status text NOT NULL DEFAULT 'pending', report jsonb, created_at timestamptz NOT NULL DEFAULT now())`;
      await tx`CREATE INDEX IF NOT EXISTS site_audits_user_created_idx ON public.site_audits(user_id, created_at)`;
      await tx`ALTER TABLE public.site_audits ADD COLUMN IF NOT EXISTS share_token_hash text`;
      await tx`ALTER TABLE public.site_audits ADD COLUMN IF NOT EXISTS share_expires_at timestamptz`;
      await tx`CREATE UNIQUE INDEX IF NOT EXISTS site_audits_share_token_idx ON public.site_audits(share_token_hash)`;
      await tx`CREATE TABLE IF NOT EXISTS public.project_agreements (project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE, agreement jsonb NOT NULL, updated_by uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT, updated_at timestamptz NOT NULL DEFAULT now())`;
      await tx`CREATE TABLE IF NOT EXISTS public.project_decisions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE, requested_by uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT, title text NOT NULL, detail text NOT NULL, state text NOT NULL DEFAULT 'pending', response text, answered_by uuid REFERENCES public.users(id) ON DELETE RESTRICT, answered_at timestamptz, created_at timestamptz NOT NULL DEFAULT now())`;
      await tx`CREATE INDEX IF NOT EXISTS project_decisions_project_idx ON public.project_decisions(project_id)`;
      await tx`ALTER TABLE public.project_decisions ADD COLUMN IF NOT EXISTS price_cents integer`;
      await tx`ALTER TABLE public.project_decisions ADD COLUMN IF NOT EXISTS extra_days integer`;
    });
    console.log("Owner permissions, subscription snapshots and private report storage ready.");
  } finally { await sql.end({ timeout: 5 }); }
}
