import { z } from "zod";
import { configuredEstimate, extraOptions, featureOptions, moduleOptions, performanceOptions, projectLanguages, projectOption, providerOptions, type ProjectConfiguration } from "../project-options";
import { featureCost } from "../pricing";

const selection = z.array(z.string().max(40)).max(30).refine(a => new Set(a).size === a.length, "Duplicate options");
export const configurationSchema = z.object({
  priceVersion: z.union([z.literal(1), z.literal(2)]).optional(),
  promotionPercent: z.number().int().min(0).max(20).optional(),
  version: z.literal(1), type: z.enum(["web", "mobile", "ai", "ecommerce", "erp", "brand"]), kind: z.string().max(40),
  features: z.array(z.enum(Object.keys(featureCost) as [keyof typeof featureCost, ...Array<keyof typeof featureCost>])).max(20),
  extras: selection, providers: selection, languages: selection.min(1), modules: selection, performance: selection,
  speed: z.enum(["relaxed", "standard", "rush"]), deliveryDays: z.number().int().min(3).max(730),
  projectName: z.string().trim().min(2).max(120), domain: z.string().trim().max(160).refine(v => !v || /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(v), "Enter a domain, not a URL"),
  name: z.string().trim().min(2).max(120), company: z.string().trim().max(160), notes: z.string().trim().max(4000), templateId: z.string().max(40),
}).strict().superRefine((data, ctx) => {
  const invalid = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
  const selected = projectOption(data.kind);
  if (!selected || selected.type !== data.type) { invalid("kind", "Invalid project type"); return; }
  if (new Set(data.features).size !== data.features.length || data.features.some(k => !featureOptions[data.type].includes(k) && !selected.features.includes(k)) || selected.features.some(k => !data.features.includes(k))) invalid("features", "Invalid or missing included modules");
  for (const [key, catalog] of [["extras", extraOptions], ["providers", providerOptions], ["modules", moduleOptions], ["performance", performanceOptions]] as const) {
    if (data[key].some(id => !catalog.some(p => p.id === id && p.types.includes(data.type)))) invalid(key, "Invalid project option");
  }
  if (data.languages.some(l => !projectLanguages.includes(l))) invalid("languages", "Invalid language");
  if (data.providers.length && !data.features.includes("auth")) invalid("providers", "Authentication module required");
  if (data.languages.length > 1 && !data.features.includes("i18n")) invalid("languages", "Language module required");
  if (["hosting", "hosting-business"].every(k => data.extras.includes(k)) || ["maintenance", "support-plus"].every(k => data.extras.includes(k))) invalid("extras", "Choose one service tier");
  if (data.deliveryDays < configuredEstimate(data as ProjectConfiguration).minimumDays) invalid("deliveryDays", "Delivery is shorter than the minimum scope estimate");
});
