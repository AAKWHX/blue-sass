"use server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireViewer, assertCanWrite } from "@/lib/db/access";
import { db, isDatabaseConfigured } from "@/lib/db";
import { leads, projects } from "@/lib/db/schema";
import { isLocale } from "@/lib/i18n/config";
import { experience } from "@/lib/i18n/experience";
import { subscriptionPlans, subscriptionIds } from "@/lib/subscriptions";
import { takeRateLimit } from "@/lib/rate-limit";
const schema = z.object({ plan: z.enum(subscriptionIds), name: z.string().trim().min(2).max(120), message: z.string().trim().max(3000), locale: z.string() });
export async function requestSubscription(_prev: { ok: boolean; message: string }, form: FormData) {
 const viewer = await requireViewer(); assertCanWrite(viewer);
 const parsed = schema.safeParse(Object.fromEntries(form));
 const rawLocale = String(form.get("locale")); const locale = isLocale(rawLocale) ? rawLocale : "en"; const c = experience(locale);
 if (!parsed.success || !isDatabaseConfigured || !takeRateLimit(`subscription:${viewer.id}`, 3, 600000)) return { ok: false, message: c.error };
 const plan = subscriptionPlans(locale).find(plan => plan.id === parsed.data.plan)!;
 const summary = `${plan.name} · €${plan.price}/month\n${c.planRequestNote}\n${parsed.data.message}`;
 await db.transaction(async tx => {
  await tx.insert(leads).values({ name: viewer.name || viewer.email, email: viewer.email, locale, projectType: "subscription", services: [`subscription:${plan.id}`], budgetEstimate: plan.price, message: summary, convertedUserId: viewer.id });
  await tx.insert(projects).values({ slug: `subscription-${randomUUID()}`, name: parsed.data.name, summary, clientId: viewer.id, stage: "planning", visibility: "private", budget: plan.price, industry: "subscription" });
 });
 revalidatePath("/[locale]/portal", "layout"); revalidatePath("/[locale]/admin", "page");
 return { ok: true, message: c.saved };
}
