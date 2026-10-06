import type { SubscriptionId } from "./subscriptions";
export const subscriptionToolLimits: Record<SubscriptionId, { reports: number; sites: number; compare: boolean; jsonExport: boolean; price: number; durationDays: number }> = {
  launch: { reports: 10, sites: 1, compare: false, jsonExport: false, price: 25, durationDays: 30 },
  growth: { reports: 40, sites: 3, compare: true, jsonExport: false, price: 65, durationDays: 30 },
  scale: { reports: 120, sites: 10, compare: true, jsonExport: true, price: 150, durationDays: 30 },
};
