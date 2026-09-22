"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { getViewer, requireRole } from "@/lib/db/access";
import { validateEmail } from "@/lib/validation/contact";
import { takeRateLimit } from "@/lib/rate-limit";
import { estimate, featureCost, type FeatureKey } from "@/lib/pricing";

export interface LeadState {
  ok: boolean;
  message: string;
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
  domain: z.string().trim().max(160).optional(),
  addOns: z.string().optional(),
  performance: z.string().max(100).optional(),
  website: z.string().max(0).optional(),
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
  const calculated = estimate(data.projectType, features as FeatureKey[], data.speed);
  const performance = (data.performance ?? "").split(",").filter(Boolean);
  if (performance.some(key => !["images", "cache", "lazy"].includes(key))) return { ok: false, message: "Invalid performance options." };
  const details = [
    data.projectName ? `Project: ${data.projectName}` : "",
    data.domain ? `Domain: ${data.domain}` : "",
    `Delivery: ${data.speed}`,
    performance.length ? `Performance: ${performance.join(", ")}` : "",
    data.message || "",
  ].filter(Boolean).join("\n");
  await db.insert(leads).values({
    name: data.name,
    email: data.email,
    company: data.company || null,
    phone: data.phone || null,
    locale: data.locale,
    projectType: data.projectType,
    services: [...(data.services ? data.services.split(",").filter(Boolean) : []), ...addOns.map((item) => `addon:${item}`)],
    budgetEstimate: calculated.low,
    timelineWeeks: calculated.weeks,
    currency: "EUR",
    message: details || null,
  });

  revalidatePath("/[locale]/admin", "page");
  return { ok: true, message: "Thank you — your request is saved. We reply within one business day." };
}

/** Admin: move a lead through the sales pipeline. */
export async function updateLeadStatusAction(formData: FormData) {
  await requireRole("super_admin", "admin", "pm");
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as (typeof leads.$inferSelect)["status"];
  await db.update(leads).set({ status }).where(eq(leads.id, id));
  revalidatePath("/[locale]/admin", "page");
}
