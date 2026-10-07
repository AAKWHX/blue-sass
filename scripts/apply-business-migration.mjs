import postgres from "postgres";
import {existsSync} from "node:fs";
import {protectServerTables} from "./server-table-security.mjs";
for(const file of [".env.local",".env"])if(existsSync(file))process.loadEnvFile(file);
if(!process.env.DATABASE_URL){console.log("No database configured: business migration skipped.");}else{
 const sql=postgres(process.env.DATABASE_URL,{max:1,prepare:false,connect_timeout:15});
 try{await sql.begin(async tx=>{
 await tx`CREATE TABLE IF NOT EXISTS public.tool_usage (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, tool text NOT NULL, credits integer NOT NULL CHECK(credits>0), status text NOT NULL DEFAULT 'pending', created_at timestamptz NOT NULL DEFAULT now())`;
 await tx`CREATE INDEX IF NOT EXISTS tool_usage_user_created_idx ON public.tool_usage(user_id,created_at)`;
 await tx`CREATE TABLE IF NOT EXISTS public.platform_content (key text PRIMARY KEY, metrics jsonb NOT NULL DEFAULT '[]', updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL, updated_at timestamptz NOT NULL DEFAULT now())`;
 await tx`CREATE TABLE IF NOT EXISTS public.marketplace_listings (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT, kind text NOT NULL CHECK(kind IN ('job','project','product')), title text NOT NULL, description text NOT NULL, category text NOT NULL, price integer NOT NULL DEFAULT 0 CHECK(price>=0), tier text NOT NULL DEFAULT 'basic', status text NOT NULL DEFAULT 'pending', company text, location text, platform_product boolean NOT NULL DEFAULT false, asset_name text, asset_data text, asset_type text, moderated_at timestamptz, created_at timestamptz NOT NULL DEFAULT now())`;
 await tx`CREATE INDEX IF NOT EXISTS marketplace_kind_status_idx ON public.marketplace_listings(kind,status)`;
 await tx`CREATE TABLE IF NOT EXISTS public.marketplace_offers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT, message text NOT NULL, amount integer NOT NULL DEFAULT 0 CHECK(amount>=0), status text NOT NULL DEFAULT 'pending', created_at timestamptz NOT NULL DEFAULT now())`;
 await tx`CREATE UNIQUE INDEX IF NOT EXISTS marketplace_offer_user_idx ON public.marketplace_offers(listing_id,user_id)`;
 await tx`CREATE TABLE IF NOT EXISTS public.marketplace_orders (project_id uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE, listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE RESTRICT, kind text NOT NULL, snapshot jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`;
 await protectServerTables(tx,["tool_usage","marketplace_listings","marketplace_offers","marketplace_orders","platform_content"]);
 });console.log("Business tables ready with private Data API access.");}finally{await sql.end();}
}
