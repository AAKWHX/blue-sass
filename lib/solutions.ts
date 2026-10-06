import type { ServiceSlug } from "./service-catalog";
export const solutionGroups = {
  company: { services: ["web", "design"], preview: "web" },
  store: { services: ["store"], preview: "store" },
  apps: { services: ["android", "ios", "windows"], preview: "android" },
  systems: { services: ["erp", "ai"], preview: "erp" },
} as const satisfies Record<string, { services: readonly ServiceSlug[]; preview: ServiceSlug }>;
export type SolutionKey = keyof typeof solutionGroups;
