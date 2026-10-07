"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/lib/db";
import { leads, payments, projectBilling, projectMilestones, projectRequests, projects, type ProjectStage } from "@/lib/db/schema";
import { assertCanWrite, getViewer } from "@/lib/db/access";
import { lifecycleState, lockProject } from "@/lib/db/project-lifecycle";
import { canChangeRequest } from "@/lib/project-policy";
import { configurationSchema } from "@/lib/validation/project-configuration";
import { configuredEstimate, projectOption } from "@/lib/project-options";
import { builderCopy } from "@/lib/i18n/project-builder";
import { getDictionary, isLocale } from "@/lib/i18n";
import { takeRateLimit } from "@/lib/rate-limit";
import { findServiceTemplate } from "@/lib/service-templates";
import { serviceQuotePresets } from "@/lib/service-details";
import { getImplementationPromotion } from "@/lib/pricing";

export type ConfigurationState = { ok: boolean; message: string; projectId?: string; fields?: string[] };
const stages: ProjectStage[] = ["planning", "design", "development", "testing", "review", "completed"];

export async function saveConfiguredProject(_prev: ConfigurationState, form: FormData): Promise<ConfigurationState> {
  const localeValue = String(form.get("locale") ?? "");
  const locale = isLocale(localeValue) ? localeValue : "en";
  const fail = { ok: false, message: builderCopy.error[locale] };
  const viewer = await getViewer();
  if (!viewer || !isDatabaseConfigured) return fail;
  assertCanWrite(viewer);
  if (!(await takeRateLimit(`configure:${viewer.id}`, 20, 10 * 60_000))) return fail;
  const raw = form.get("configuration");
  if (typeof raw !== "string" || raw.length > 16000) return fail;
  let input: unknown;
  try { input = JSON.parse(raw); } catch { return fail; }
  const parsed = configurationSchema.safeParse(input);
  if (!parsed.success) return { ...fail, fields: [...new Set(parsed.error.issues.map(i => String(i.path[0])))] };
  const config = { ...parsed.data, priceVersion: 2 as 1 | 2, promotionPercent: getImplementationPromotion().percent as number };
  const template = config.templateId ? findServiceTemplate(config.templateId, locale) : null;
  if (config.templateId && (!template || serviceQuotePresets[template.service].type !== config.type)) return fail;
  let quote = configuredEstimate(config);
  const projectIdValue = String(form.get("projectId") ?? "");
  if (projectIdValue && !z.string().uuid().safeParse(projectIdValue).success) return fail;
  const selected = projectOption(config.kind)!;
  const summary = [selected.names[locale], config.notes].filter(Boolean).join("\n");
  const leadServices = [...config.features, ...config.extras.map(k => `addon:${k}`), ...config.providers.map(k => `login:${k}`), ...config.languages.map(k => `lang:${k}`), ...config.modules.map(k => `module:${k}`), ...config.performance.map(k => `performance:${k}`)];
  let savedId: string | null;
  try {
    savedId = await db.transaction(async tx => {
      if (projectIdValue) {
        const project = await lockProject(tx, projectIdValue);
        if(!project||["commerce","subscription"].includes(project.industry))return null;
        const state = await lifecycleState(projectIdValue, tx);
        if (!canChangeRequest(project, viewer.id, state)) return null;
        // Same row lock as Checkout: configuration and payment cannot race.
        const [active] = await tx.select({ id: payments.id }).from(payments).where(and(eq(payments.projectId, projectIdValue), inArray(payments.status, ["pending", "paid"]))).limit(1);
        if (active) return null;
        const [stored] = await tx.select().from(projectRequests).where(eq(projectRequests.projectId, projectIdValue)).limit(1);
        config.priceVersion = stored?.configuration.priceVersion ?? 1;
        config.promotionPercent = stored?.configuration.promotionPercent ?? (stored?.estimate.baseLow ? Math.round(stored.estimate.discount / stored.estimate.baseLow * 100) : getImplementationPromotion().percent);
        quote = configuredEstimate(config);
        await tx.update(projectBilling).set({ approvedTotalCents: null, approvedBy: null, approvedAt: null }).where(eq(projectBilling.projectId, projectIdValue));
        await tx.update(projects).set({ name: config.projectName, summary, industry: config.type, budget: quote.totalLow, tech: config.features, deadline: null, estimatedHours: Math.max(24, quote.weeks * 32), updatedAt: new Date() }).where(eq(projects.id, projectIdValue));
        await tx.insert(projectRequests).values({ projectId: projectIdValue, configuration: config, estimate: quote }).onConflictDoUpdate({ target: projectRequests.projectId, set: { configuration: config, estimate: quote, updatedAt: new Date() } });
        if (stored?.leadId) await tx.update(leads).set({ name: config.name, company: config.company || null, projectType: config.type, services: leadServices, budgetEstimate: quote.totalLow, timelineWeeks: Math.ceil(config.deliveryDays / 7), message: summary }).where(eq(leads.id, stored.leadId));
        await tx.update(projectMilestones).set({ dueDate: null, estimatedHours: Math.max(4, Math.round(quote.weeks * 32 / 6)) }).where(eq(projectMilestones.projectId, projectIdValue));
        return projectIdValue;
      }
      const [lead] = await tx.insert(leads).values({ name: config.name, email: viewer.email.toLowerCase(), company: config.company || null, locale, projectType: config.type, services: leadServices, budgetEstimate: quote.totalLow, timelineWeeks: Math.ceil(config.deliveryDays / 7), currency: "EUR", message: summary, convertedUserId: viewer.id }).returning({ id: leads.id });
      const id = randomUUID();
      await tx.insert(projects).values({ id, slug: `request-${id}`, name: config.projectName, summary, clientId: viewer.id, stage: "planning", progress: 0, visibility: "private", industry: config.type, budget: quote.totalLow, currency: "EUR", startDate: null, deadline: null, estimatedHours: Math.max(24, quote.weeks * 32), hoursLogged: 0, tech: config.features });
      await tx.insert(projectRequests).values({ projectId: id, leadId: lead.id, configuration: config, estimate: quote });
      await tx.insert(projectBilling).values({ projectId: id });
      const dictionary = getDictionary(locale);
      await tx.insert(projectMilestones).values(stages.map((stage, index) => ({ projectId: id, title: dictionary.status[stage], stage, status: "todo" as const, dueDate: null, estimatedHours: Math.max(4, Math.round(quote.weeks * 32 / 6)), orderIndex: index })));
      return id;
    });
  } catch {
    return fail;
  }
  if (!savedId) return fail;
  revalidatePath("/[locale]/portal", "layout");
  revalidatePath("/[locale]/admin", "page");
  if (!projectIdValue && form.get("paymentChoice") === "now") redirect(`/${locale}/portal/projects/${savedId}/payment`);
  return { ok: true, message: builderCopy.saved[locale], projectId: savedId };
}
