"use client";
import { useI18n } from "@/components/providers";
import { ProjectBuilder } from "./project-builder";
import { initialConfiguration, featureOptions, moduleOptions, projectLanguages } from "@/lib/project-options";
import { serviceQuotePresets } from "@/lib/service-details";
import { serviceSlugs, type ServiceSlug } from "@/lib/service-catalog";
import { findServiceTemplate } from "@/lib/service-templates";
import type { ProjectType } from "@/lib/pricing";

export function QuoteWizard({ initialType, initialService, initialTemplate, initialKind, initialFeatures, initialModules, initialLanguageCount, initialEmail = "", payments }: { initialType?: string; initialService?: string; initialTemplate?: string; initialKind?: string; initialFeatures?: string; initialModules?: string; initialLanguageCount?: string; initialEmail?: string; payments: { paypal: boolean } }) {
  const { locale } = useI18n();
  const service = serviceSlugs.includes(initialService as ServiceSlug) ? serviceQuotePresets[initialService as ServiceSlug] : null;
  const type = service?.type ?? (["web", "mobile", "ai", "ecommerce", "erp", "brand"].includes(initialType ?? "") ? initialType as ProjectType : "web");
  const serviceKinds: Record<ServiceSlug, string> = { web: "company", android: "android", ios: "ios", windows: "windows", store: "store", erp: "dashboard", ai: "ai-assistant", design: "ui-ux" };
  const initial = initialConfiguration(type, initialKind ?? (service ? serviceKinds[initialService as ServiceSlug] : undefined));
  initial.languages = [locale];
  initial.features=[...new Set([...initial.features,...(initialFeatures??"").split(",").filter(value=>featureOptions[initial.type].includes(value as never)) as typeof initial.features])];
  initial.modules=(initialModules??"").split(",").filter(value=>moduleOptions.some(option=>option.id===value&&option.types.includes(initial.type)));
  const count=Number(initialLanguageCount);if(Number.isInteger(count)&&count>1&&count<=15){initial.languages=[locale,...projectLanguages.filter(value=>value!==locale)].slice(0,count);if(featureOptions[initial.type].includes("i18n"))initial.features=[...new Set([...initial.features,"i18n" as const])];}
  const template = findServiceTemplate(initialTemplate, locale);
  if (template && template.service === initialService && service?.type === initial.type) {
    initial.templateId = template.id;
    initial.features = [...new Set([...initial.features, ...template.features.filter(f => featureOptions[initial.type].includes(f))])];
  }
  return <ProjectBuilder initial={initial} email={initialEmail} paypal={payments.paypal}/>;
}
