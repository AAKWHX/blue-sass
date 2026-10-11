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
