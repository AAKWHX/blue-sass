export type ProjectType = "web" | "mobile" | "ai" | "ecommerce" | "erp" | "brand";
export type Speed = "relaxed" | "standard" | "rush";
export type FeatureKey = "auth" | "payments" | "dashboard" | "i18n" | "cms" | "api" | "ai" | "realtime" | "prototype" | "identity" | "appstore" | "offline" | "catalog" | "automation";

export const implementationPrice = (amount: number) => Math.round(amount * 0.4);
const previousBaseCost: Record<ProjectType, { price: number; weeks: number }> = {
  web: { price: 745, weeks: 4 },
  mobile: { price: 3950, weeks: 10 },
  ai: { price: 2450, weeks: 8 },
  ecommerce: { price: 1245, weeks: 5 },
  erp: { price: 3450, weeks: 10 },
  brand: { price: 395, weeks: 3 },
};

export const baseCost = Object.fromEntries(Object.entries(previousBaseCost).map(([key, value]) => [key, { ...value, price: implementationPrice(value.price) }])) as typeof previousBaseCost;
const previousFeatureCost: Record<FeatureKey, { price: number; weeks: number }> = {
  auth: { price: 225, weeks: 1 },
  payments: { price: 325, weeks: 2 },
  dashboard: { price: 450, weeks: 2 },
  i18n: { price: 125, weeks: 1.5 },
  cms: { price: 175, weeks: 1.5 },
  api: { price: 325, weeks: 1 },
  ai: { price: 750, weeks: 3 },
  realtime: { price: 550, weeks: 2 },
  prototype: { price: 225, weeks: 1 },
  identity: { price: 325, weeks: 2 },
  appstore: { price: 175, weeks: 1 },
  offline: { price: 450, weeks: 2 },
  catalog: { price: 250, weeks: 1.5 },
  automation: { price: 450, weeks: 2 },
};

export const featureCost = Object.fromEntries(Object.entries(previousFeatureCost).map(([key, value]) => [key, { ...value, price: implementationPrice(value.price) }])) as typeof previousFeatureCost;
export const speedModifier: Record<Speed, { price: number; weeks: number }> = {
  relaxed: { price: 1, weeks: 1.25 },
  standard: { price: 1, weeks: 1 },
  rush: { price: 1.4, weeks: 0.7 },
};

export interface Estimate {
  low: number;
  high: number;
  weeks: number;
  deposit: number;
  baseLow: number;
  baseHigh: number;
  discount: number;
}

export const reservationDeposit: Record<ProjectType, number> = {
  web: 50,
  mobile: 100,
  ai: 125,
  ecommerce: 75,
  erp: 150,
  brand: 40,
};

const promotions = [
  { id: "START5", percent: 5 },
  { id: "BUILD10", percent: 10 },
  { id: "LAUNCH15", percent: 15 },
] as const;
export function getImplementationPromotion(date = new Date()) {
  const day = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000);
  return promotions[day % promotions.length];
}
export function applyImplementationDiscount(amount: number, date?: Date) {
  return Math.round(amount * (100 - getImplementationPromotion(date).percent) / 100);
}
type PackageEstimate = { low: number; high: number; weeks: number; type: ProjectType; features: FeatureKey[] };
export function estimate(type: ProjectType, features: FeatureKey[], speed: Speed, selected?: PackageEstimate, priceFactor = 1, promotionPercent: number = getImplementationPromotion().percent): Estimate {
  const pack = selected?.type === type ? selected : undefined;
  const base = baseCost[type];
  const extras = [...new Set(features)].filter(key => !pack?.features.includes(key)).reduce(
    (acc, key) => ({ price: acc.price + featureCost[key].price * priceFactor, weeks: acc.weeks + featureCost[key].weeks }),
    { price: 0, weeks: 0 },
  );
  const mod = speedModifier[speed];
  const baseLow = Math.round(((pack?.low ?? base.price) + extras.price) * mod.price);
  const baseHigh = Math.round(((pack?.high ?? base.price * 1.4) + extras.price * 1.2) * mod.price);
  const low = Math.round(baseLow * (100 - promotionPercent) / 100);
  return { low, high: Math.round(baseHigh * (100 - promotionPercent) / 100), baseLow, baseHigh, discount: baseLow - low, weeks: Math.ceil(((pack?.weeks ?? base.weeks) + extras.weeks) * mod.weeks), deposit: reservationDeposit[type] };
}

export function formatEUR(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}
