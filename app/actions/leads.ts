"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { requireRole } from "@/lib/db/access";
import { validateEmail } from "@/lib/validation/contact";

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
  projectType: z.string().default("website"),
  services: z.string().optional(),
  budgetEstimate: z.coerce.number().int().min(0).default(0),
  timelineWeeks: z.coerce.number().int().min(0).default(0),
  currency: z.string().default("EUR"),
  message: z.string().trim().max(4000).optional(),
});

/**
 * Public quote submission. Saves the calculator output alongside the contact
 * details so the sales team sees exactly what the visitor configured.
 */
export async function submitLeadAction(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  if (!isDatabaseConfigured) {
    // Preview mode: accept the submission so the UX can be demonstrated.
    return {
      ok: true,
      message: "Request received (preview mode — connect DATABASE_URL to persist it).",
    };
  }

  const data = parsed.data;
  await db.insert(leads).values({
    name: data.name,
    email: data.email,
    company: data.company || null,
    phone: data.phone || null,
    locale: data.locale,
    projectType: data.projectType,
    services: data.services ? data.services.split(",").filter(Boolean) : [],
    budgetEstimate: data.budgetEstimate,
    timelineWeeks: data.timelineWeeks,
    currency: data.currency,
    message: data.message || null,
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
