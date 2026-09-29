import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getViewer } from "@/lib/db/access";
import { db } from "@/lib/db";

export async function POST() {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.execute(sql`ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "environment" text DEFAULT 'sandbox' NOT NULL`);
  await db.execute(sql`ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_project_id_unique"`);
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "payments_project_environment_unique" ON "payments" ("project_id", "environment")`);
  return NextResponse.json({ ok: true });
}
