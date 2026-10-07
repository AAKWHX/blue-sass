import type { SubscriptionId } from "./subscriptions";
export const subscriptionToolLimits: Record<SubscriptionId, { reports: number; sites: number; compare: boolean; jsonExport: boolean; price: number; durationDays: number }> = {
  launch: { reports: 100, sites: 1, compare: true, jsonExport: false, price: 19, durationDays: 30 },
  growth: { reports: 500, sites: 5, compare: true, jsonExport: true, price: 49, durationDays: 30 },
  scale: { reports: 2000, sites: 25, compare: true, jsonExport: true, price: 129, durationDays: 30 },
};
