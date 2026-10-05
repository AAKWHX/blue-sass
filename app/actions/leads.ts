"use server";
import { withExtraLocales } from "@/lib/i18n/extra-locales";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/lib/db";
import { leads, projectMilestones, projects, type ProjectStage } from "@/lib/db/schema";
import { getViewer, requireRole, assertCanWrite } from "@/lib/db/access";
import { validateEmail } from "@/lib/validation/contact";
import { takeRateLimit } from "@/lib/rate-limit";
import { estimate, featureCost, getImplementationPromotion, type FeatureKey } from "@/lib/pricing";
import { findServiceTemplate } from "@/lib/service-templates";
import { isLocale } from "@/lib/i18n/config";
import { serviceQuotePresets } from "@/lib/service-details";
import { websitePackage, websitePackageName } from "@/lib/website-packages";
import { pricingCopy } from "@/lib/i18n/pricing-copy";

export interface LeadState {
  ok: boolean;
  message: string;
  projectId?: string;
  fieldErrors?: Record<string, string>;
}

const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  // Same ASCII-only rule as signup: a browser `type="email"` check is bypassable.
  email: z
    .string()
    .transform((raw) => raw.trim().toLowerCase())
    .superRefine((value, ctx) => {
      const result = validateEmail(value);
      if (result.ok) return;
      ctx.addIssue({
        code: "custom",
        message:
          result.code === "nonAscii"
            ? "Use Latin letters only — Arabic characters are not allowed in an email address."
            : "Enter a valid email address.",
      });
    }),
  company: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  locale: z.string().default("ar"),
  projectType: z.enum(["web", "mobile", "ai", "ecommerce", "erp", "brand"]),
  speed: z.enum(["relaxed", "standard", "rush"]).default("standard"),
  services: z.string().optional(),
  budgetEstimate: z.coerce.number().int().min(0).default(0),
  timelineWeeks: z.coerce.number().int().min(0).default(0),
  currency: z.string().default("EUR"),
  message: z.string().trim().max(4000).optional(),
  projectName: z.string().trim().max(120).optional(),
  templateId: z.string().max(40).optional(),
  kind: z.string().max(40).optional(),
  domain: z.string().trim().max(160).optional(),
  addOns: z.string().optional(),
  performance: z.string().max(100).optional(),
  website: z.string().max(0).optional(),
});

const milestoneTitles: Record<string, string[]> = withExtraLocales({
  ar: ["التخطيط واعتماد النطاق", "تصميم تجربة المستخدم والواجهات", "التطوير والربط", "الاختبار وضمان الجودة", "مراجعة العميل والتعديلات", "الإطلاق والتسليم"],
  en: ["Planning and scope approval", "UX and interface design", "Development and integrations", "Testing and quality assurance", "Client review and refinements", "Launch and handover"],
  nl: ["Planning en scopegoedkeuring", "UX- en interfaceontwerp", "Ontwikkeling en koppelingen", "Testen en kwaliteitscontrole", "Klantreview en aanpassingen", "Lancering en overdracht"],
  de: ["Planung und Freigabe", "UX- und Oberflächendesign", "Entwicklung und Anbindungen", "Tests und Qualitätssicherung", "Kundenprüfung und Anpassungen", "Start und Übergabe"],
  tr: ["Planlama ve kapsam onayı", "UX ve arayüz tasarımı", "Geliştirme ve bağlantılar", "Test ve kalite kontrol", "Müşteri incelemesi ve düzenlemeler", "Yayın ve teslim"],
  fr: ["Planification et validation", "UX et conception d’interface", "Développement et intégrations", "Tests et assurance qualité", "Revue client et ajustements", "Lancement et transfert"],
  es: ["Planificación y aprobación", "UX y diseño de interfaz", "Desarrollo e integraciones", "Pruebas y control de calidad", "Revisión y ajustes del cliente", "Lanzamiento y entrega"],
});
const stages: ProjectStage[] = ["planning", "design", "development", "testing", "review", "completed"];
const savedMessages: Record<string, string> = withExtraLocales({
  ar: "تم حفظ الطلب وإنشاء مساحة المشروع في لوحة حسابك.", en: "Your request is saved and its project workspace is ready in your dashboard.",
  nl: "Uw aanvraag is opgeslagen en de projectruimte staat klaar in uw dashboard.", de: "Ihre Anfrage wurde gespeichert und der Projektbereich ist im Dashboard verfügbar.",
  tr: "Talebiniz kaydedildi ve proje alanı panelinizde hazır.", fr: "Votre demande est enregistrée et l’espace projet est prêt dans votre tableau de bord.",
  es: "Su solicitud está guardada y el espacio del proyecto está listo en su panel.",
});

/**
 * Public quote submission. Saves the calculator output alongside the contact
 * details so the sales team sees exactly what the visitor configured.
 */
export async function submitLeadAction(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, message: "Sign in before saving a project request." };
  assertCanWrite(viewer);
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  // Honeypot + per-process rate limit make automated form spam costly without
  // exposing any customer data to a third-party CAPTCHA provider.
  if (parsed.data.website) return { ok: true, message: "Thank you." };
  if (!takeRateLimit(`lead:${parsed.data.email}`, 3, 10 * 60_000)) {
    return { ok: false, message: "Too many requests. Please try again later." };
  }

  if (!isDatabaseConfigured) {
    // Preview mode: accept the submission so the UX can be demonstrated.
    return {
      ok: false,
      message: "Saving is temporarily unavailable. Please try again later.",
    };
  }

  const data = parsed.data;
  // The authenticated identity is authoritative. A hidden form field must
  // never be able to create, view, or later claim someone else's request.
  if (data.email !== viewer.email.toLowerCase()) {
    return { ok: false, message: "Use the email address of your signed-in account." };
  }
  const addOns = data.addOns ? data.addOns.split(",").filter(Boolean) : [];
  const features = [...new Set((data.services ?? "").split(",").filter(Boolean))];
  if (features.some((key) => !Object.hasOwn(featureCost, key)) || addOns.some((key) => !["domain", "email", "hosting", "maintenance", "google", "analytics"].includes(key))) {
    return { ok: false, message: "Invalid project options." };
  }
  const pack = websitePackage(data.kind);
  if (data.kind && (!pack || pack.type !== data.projectType || pack.features.some(key => !features.includes(key)))) return { ok: false, message: "Invalid website package." };
  const calculated = estimate(data.projectType, features as FeatureKey[], data.speed, pack);
  const promotion = getImplementationPromotion();
  const locale = isLocale(data.locale) ? data.locale : "en";
  const pricing = pricingCopy(locale);
  const template = findServiceTemplate(data.templateId, isLocale(data.locale) ? data.locale : "en");
  if (data.templateId && (!template || serviceQuotePresets[template.service].type !== data.projectType)) return { ok: false, message: "Invalid template." };
  const performance = (data.performance ?? "").split(",").filter(Boolean);
  if (performance.some(key => !["images", "cache", "lazy"].includes(key))) return { ok: false, message: "Invalid performance options." };
  const details = [
    pack ? `${websitePackageName(pack.id,locale)} (${pack.id})` : "",
    `${pricing.base}: EUR ${calculated.baseLow}–${calculated.baseHigh}`,
    `${promotion.id}: ${promotion.percent}% · ${pricing.discount}: EUR ${calculated.discount} · EUR ${calculated.low}–${calculated.high}`,
    pricing.tax,
    template ? `Template: ${template.name} (${template.id})` : "",
    data.projectName ? `Project: ${data.projectName}` : "",
    data.domain ? `Domain: ${data.domain}` : "",
    `Delivery: ${data.speed}`,
    performance.length ? `Performance: ${performance.join(", ")}` : "",
    data.message || "",
  ].filter(Boolean).join("\n");
  const projectName = data.projectName || `${data.projectType.toUpperCase()} project`;
  const now = new Date();
  const deadline = new Date(now.getTime() + calculated.weeks * 7 * 86_400_000);
  const titles = milestoneTitles[data.locale] ?? milestoneTitles.en;
  const projectId = await db.transaction(async (tx) => {
    await tx.insert(leads).values({
      name: data.name, email: data.email, company: data.company || null, phone: data.phone || null,
      locale: data.locale, projectType: data.projectType,
      services: [...(data.services ? data.services.split(",").filter(Boolean) : []), ...addOns.map((item) => `addon:${item}`)],
      budgetEstimate: calculated.low, timelineWeeks: calculated.weeks, currency: "EUR", message: details || null,
      convertedUserId: viewer.id,
    });
    const [project] = await tx.insert(projects).values({
      slug: `request-${Date.now()}-${viewer.id.slice(0, 8)}`,
      name: projectName,
      summary: details || `Requested ${data.projectType} project`,
      clientId: viewer.id,
      stage: "planning",
      progress: 0,
      visibility: "private",
      industry: data.projectType,
      budget: calculated.low,
      currency: "EUR",
      startDate: null,
      deadline,
      estimatedHours: Math.max(24, calculated.weeks * 32),
      hoursLogged: 0,
      tech: features,
    }).returning({ id: projects.id });
    await tx.insert(projectMilestones).values(stages.map((stage, index) => ({
      projectId: project.id,
      title: titles[index],
      stage,
      status: "todo" as const,
      dueDate: new Date(now.getTime() + Math.max(1, Math.round(calculated.weeks * (index + 1) / stages.length)) * 7 * 86_400_000),
      estimatedHours: Math.max(4, Math.round(calculated.weeks * 32 / stages.length)),
      orderIndex: index,
    })));
    return project.id;
  });

  revalidatePath("/[locale]/admin", "page");
  revalidatePath("/[locale]/portal", "page");
  return { ok: true, message: savedMessages[data.locale] ?? savedMessages.en, projectId };
}

/** Admin: move a lead through the sales pipeline. */
export async function updateLeadStatusAction(formData: FormData) {
  await requireRole("super_admin", "admin", "pm");
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as (typeof leads.$inferSelect)["status"];
  await db.update(leads).set({ status }).where(eq(leads.id, id));
  revalidatePath("/[locale]/admin", "page");
}
