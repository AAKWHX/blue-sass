"use server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireViewer, assertCanWrite } from "@/lib/db/access";
import { db, isDatabaseConfigured } from "@/lib/db";
import { leads, projects, subscriptionOrders } from "@/lib/db/schema";
import { subscriptionToolLimits } from "@/lib/subscription-tools";
import { isLocale } from "@/lib/i18n/config";
import { experience } from "@/lib/i18n/experience";
import { subscriptionPlans, subscriptionIds, subscriptionPurchaseNote } from "@/lib/subscriptions";
import { takeRateLimit } from "@/lib/rate-limit";
import { platformCopy } from "@/lib/i18n/platform-tools";
const schema = z.object({ plan: z.enum(subscriptionIds), name: z.string().trim().min(2).max(120), message: z.string().trim().max(3000), locale: z.string() });
export type SubscriptionState = { ok: boolean; message: string; projectId?: string };
export async function requestSubscription(_prev: SubscriptionState, form: FormData): Promise<SubscriptionState> {
 const viewer = await requireViewer(); assertCanWrite(viewer);
 const parsed = schema.safeParse(Object.fromEntries(form));
 const rawLocale = String(form.get("locale")); const locale = isLocale(rawLocale) ? rawLocale : "en"; const c = experience(locale);
 if (!parsed.success || !isDatabaseConfigured || !takeRateLimit(`subscription:${viewer.id}`, 3, 600000)) return { ok: false, message: c.error };
 const plan = subscriptionPlans(locale).find(plan => plan.id === parsed.data.plan)!;
 const summary = `${plan.name} · €${plan.price}/30 days\n${plan.features.join("\n")}\n${platformCopy(locale).planNote}\n${subscriptionPurchaseNote[locale]}\n${parsed.data.message}`;
 const projectId = await db.transaction(async tx => {
  await tx.insert(leads).values({ name: viewer.name || viewer.email, email: viewer.email, locale, projectType: "subscription", services: [`subscription:${plan.id}`], budgetEstimate: plan.price, message: summary, convertedUserId: viewer.id });
  const [project] = await tx.insert(projects).values({ slug: `subscription-${randomUUID()}`, name: parsed.data.name, summary, clientId: viewer.id, stage: "planning", visibility: "private", budget: plan.price, industry: "subscription" }).returning({ id: projects.id });
  await tx.insert(subscriptionOrders).values({ projectId: project.id, planId: plan.id, version: 2, snapshot: subscriptionToolLimits[plan.id] });
  return project.id;
 });
 revalidatePath("/[locale]/portal", "layout"); revalidatePath("/[locale]/admin", "page");
 redirect(`/${locale}/portal/projects/${projectId}/payment`);
}
