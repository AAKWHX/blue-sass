import { redirect } from "next/navigation";
import { getViewer } from "@/lib/db/access";
import { Button } from "@/components/ui/button";

export default async function PaymentSchemaUpgradePage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/ar/login");

  return (
    <main className="container-x py-20">
      <form action="/api/internal/payment-schema" method="post" className="mx-auto max-w-lg rounded-3xl border border-line bg-surface p-8 text-center">
        <h1 className="text-2xl font-black text-ink-high">ترقية قاعدة بيانات الدفع</h1>
        <p className="mt-4 text-sm leading-7 text-ink-low">إجراء مؤقت ومصادق عليه لفصل مدفوعات Sandbox عن Live.</p>
        <Button type="submit" variant="neon" className="mt-7">تطبيق الترقية الآمنة</Button>
      </form>
    </main>
  );
}
