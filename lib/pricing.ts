export type ProjectType = "web" | "mobile" | "ai" | "ecommerce" | "erp" | "brand";
export type Speed = "relaxed" | "standard" | "rush";
export type FeatureKey = "auth" | "payments" | "dashboard" | "i18n" | "cms" | "api" | "ai" | "realtime" | "prototype" | "identity" | "appstore" | "offline" | "catalog" | "automation";

export const baseCost: Record<ProjectType, { price: number; weeks: number }> = {
  web: { price: 1490, weeks: 4 },
  mobile: { price: 7900, weeks: 10 },
  ai: { price: 4900, weeks: 8 },
  ecommerce: { price: 2490, weeks: 5 },
  erp: { price: 6900, weeks: 10 },
  brand: { price: 790, weeks: 3 },
};

export const featureCost: Record<FeatureKey, { price: number; weeks: number }> = {
  auth: { price: 450, weeks: 1 },
  payments: { price: 650, weeks: 2 },
  dashboard: { price: 900, weeks: 2 },
  i18n: { price: 250, weeks: 1.5 },
  cms: { price: 350, weeks: 1.5 },
  api: { price: 650, weeks: 1 },
  ai: { price: 1500, weeks: 3 },
  realtime: { price: 1100, weeks: 2 },
  prototype: { price: 450, weeks: 1 },
  identity: { price: 650, weeks: 2 },
  appstore: { price: 350, weeks: 1 },
  offline: { price: 900, weeks: 2 },
  catalog: { price: 500, weeks: 1.5 },
  automation: { price: 900, weeks: 2 },
};

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
  web: 99,
  mobile: 199,
  ai: 249,
  ecommerce: 149,
  erp: 299,
  brand: 79,
};

export const implementationPromotion = { id: "BUILD10", percent: 10 } as const;
export function applyImplementationDiscount(amount: number) {
  return Math.round(amount * (100 - implementationPromotion.percent) / 100);
}
type PackageEstimate = { low: number; high: number; weeks: number; type: ProjectType; features: FeatureKey[] };
export function estimate(type: ProjectType, features: FeatureKey[], speed: Speed, selected?: PackageEstimate): Estimate {
  const pack = selected?.type === type ? selected : undefined;
  const base = baseCost[type];
  const extras = [...new Set(features)].filter(key => !pack?.features.includes(key)).reduce(
    (acc, key) => ({ price: acc.price + featureCost[key].price, weeks: acc.weeks + featureCost[key].weeks }),
    { price: 0, weeks: 0 },
  );
  const mod = speedModifier[speed];
  const baseLow = Math.round(((pack?.low ?? base.price) + extras.price) * mod.price);
  const baseHigh = Math.round(((pack?.high ?? base.price * 1.4) + extras.price * 1.2) * mod.price);
  const low = applyImplementationDiscount(baseLow);
  return { low, high: applyImplementationDiscount(baseHigh), baseLow, baseHigh, discount: baseLow - low, weeks: Math.ceil(((pack?.weeks ?? base.weeks) + extras.weeks) * mod.weeks), deposit: reservationDeposit[type] };
}

export function formatEUR(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}
