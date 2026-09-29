import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { getViewer } from "@/lib/db/access";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";

async function upgradePaymentSchema() {
  "use server";
  const viewer = await getViewer();
  if (!viewer) redirect("/ar/login");
  await db.execute(sql`ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "environment" text DEFAULT 'sandbox' NOT NULL`);
  await db.execute(sql`ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_project_id_unique"`);
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "payments_project_environment_unique" ON "payments" ("project_id", "environment")`);
  redirect("/ar/portal/projects/18937150-5d27-4d73-9e87-7d1ce88b2ac6/payment");
}

export default async function PaymentSchemaUpgradePage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/ar/login");

  return (
    <main className="container-x py-20">
      <form action={upgradePaymentSchema} className="mx-auto max-w-lg rounded-3xl border border-line bg-surface p-8 text-center">
        <h1 className="text-2xl font-black text-ink-high">ترقية قاعدة بيانات الدفع</h1>
        <p className="mt-4 text-sm leading-7 text-ink-low">إجراء مؤقت ومصادق عليه لفصل مدفوعات Sandbox عن Live.</p>
        <Button type="submit" variant="neon" className="mt-7">تطبيق الترقية الآمنة</Button>
      </form>
    </main>
  );
}
