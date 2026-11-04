import { z } from "zod";
import { locales } from "@/lib/i18n/config";
import { validateEmail } from "@/lib/validation/contact";
export const inquirySchema=z.object({
 name:z.string().trim().min(2).max(120),
 email:z.string().trim().toLowerCase().max(254).refine(value=>validateEmail(value).ok),
 company:z.string().trim().max(160).default(""),
 projectType:z.enum(["web","mobile","ai","ecommerce","erp","brand"]),
 budget:z.enum(["unspecified","under1000","1000to5000","5000to15000","over15000"]).default("unspecified"),
 message:z.string().trim().min(20).max(3000),
 locale:z.enum(locales),
 website:z.string().max(0).default(""),
}).strict();

export const PRIMARY_CONTACT_EMAIL = "help@bluesass.nl";

const localizedSubjects: Record<string, string> = {
 ar: "استفسار مشروع — Blue Sass",
 en: "Project Inquiry — Blue Sass",
 nl: "Projectaanvraag — Blue Sass",
};

export function localizedContactMailto(locale: string): string {
 const subject = localizedSubjects[locale] ?? localizedSubjects.en;
 return `mailto:${PRIMARY_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export function buildInquiryMailtoUrl(raw: {
 name?: string;
 email?: string;
 company?: string;
 projectType?: string;
 budget?: string;
 message?: string;
 locale?: string;
}): string {
 const name = String(raw.name ?? "").trim().slice(0, 120);
 const email = String(raw.email ?? "").trim().slice(0, 254);
 const company = String(raw.company ?? "").trim().slice(0, 160);
 const projectType = String(raw.projectType ?? "web").trim().slice(0, 40);
 const budget = String(raw.budget ?? "unspecified").trim().slice(0, 40);
 const message = String(raw.message ?? "").trim().slice(0, 3000);
 const subject = `Blue Sass Inquiry — ${projectType}${name ? ` (${name})` : ""}`;
 const body = [
  name ? `Name: ${name}` : null,
  email ? `Email: ${email}` : null,
  company ? `Company: ${company}` : null,
  `Service: ${projectType}`,
  `Budget: ${budget}`,
  "",
  message,
 ].filter(line => line !== null).join("\r\n");
 return `mailto:help@bluesass.nl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
