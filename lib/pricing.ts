export type ProjectType = "web" | "mobile" | "ai" | "ecommerce" | "erp" | "brand";
export type Speed = "relaxed" | "standard" | "rush";
export type FeatureKey = "auth" | "payments" | "dashboard" | "i18n" | "cms" | "api" | "ai" | "realtime";

export const baseCost: Record<ProjectType, { price: number; weeks: number }> = {
  web: { price: 24000, weeks: 8 },
  mobile: { price: 38000, weeks: 12 },
  ai: { price: 46000, weeks: 14 },
  ecommerce: { price: 32000, weeks: 10 },
  erp: { price: 68000, weeks: 20 },
  brand: { price: 15000, weeks: 6 },
};

export const featureCost: Record<FeatureKey, { price: number; weeks: number }> = {
  auth: { price: 4500, weeks: 1 },
  payments: { price: 8000, weeks: 2 },
  dashboard: { price: 9500, weeks: 2 },
  i18n: { price: 6000, weeks: 1.5 },
  cms: { price: 7000, weeks: 1.5 },
  api: { price: 5500, weeks: 1 },
  ai: { price: 14000, weeks: 3 },
  realtime: { price: 10000, weeks: 2 },
};

export const speedModifier: Record<Speed, { price: number; weeks: number }> = {
  relaxed: { price: 0.9, weeks: 1.25 },
  standard: { price: 1, weeks: 1 },
  rush: { price: 1.4, weeks: 0.7 },
};

export interface Estimate {
  low: number;
  high: number;
  weeks: number;
}

export function estimate(type: ProjectType, features: FeatureKey[], speed: Speed): Estimate {
  const base = baseCost[type];
  const extras = features.reduce(
    (acc, f) => ({ price: acc.price + featureCost[f].price, weeks: acc.weeks + featureCost[f].weeks }),
    { price: 0, weeks: 0 },
  );
  const mod = speedModifier[speed];
  const price = (base.price + extras.price) * mod.price;
  const weeks = Math.round((base.weeks + extras.weeks) * mod.weeks);

  return {
    low: Math.round((price * 0.9) / 500) * 500,
    high: Math.round((price * 1.2) / 500) * 500,
    weeks,
  };
}

export function formatEUR(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}
