import test from "node:test";
import assert from "node:assert/strict";
import { load } from "./test-typescript-loader.mjs";
const { estimate, applyImplementationDiscount, featureCost } = load("lib/pricing.ts");
const { websitePackages, websiteNames } = load("lib/website-packages.ts");
const { pricingCopy } = load("lib/i18n/pricing-copy.ts");
const { quoteReturnPath } = load("lib/auth/return-path.ts");
test("website type survives authentication", () => {
 assert.equal(quoteReturnPath("/ar/quote?kind=landing&type=web", "ar"), "/ar/quote?type=web&kind=landing");
});
test("19 distinct packages match the advertised discounted calculator", () => {
 assert.equal(websitePackages.length,19);
 assert.equal(new Set(websitePackages.map(p=>p.id)).size,19);
 for(const pack of websitePackages) {
  const result=estimate(pack.type,pack.features,"standard",pack);
  assert.equal(result.low,applyImplementationDiscount(pack.low));
  assert.equal(result.high,applyImplementationDiscount(pack.high));
  assert.equal(result.baseLow,pack.low);
  assert.ok(result.low>0 && result.high>=result.low);
  assert.ok(Number.isInteger(result.low));
 }
});
test("included modules are not charged twice and extra modules increase scope", () => {
 const pack=websitePackages.find(p=>p.id==="company");
 const basic=estimate(pack.type,[...pack.features,...pack.features],"standard",pack);
 const extra=estimate(pack.type,[...pack.features,"api"],"standard",pack);
 assert.equal(basic.baseLow,pack.low);
 assert.equal(extra.baseLow,pack.low+featureCost.api.price);
 assert.equal(extra.discount,extra.baseLow-extra.low);
});
test("discount does not stack with the flexible schedule", () => {
 const pack=websitePackages[0];
 assert.equal(estimate(pack.type,[],"relaxed",pack).low,applyImplementationDiscount(pack.low));
 assert.equal(estimate(pack.type,[],"standard",pack).low,applyImplementationDiscount(pack.low));
});
test("all seven languages contain every package and pricing label", () => {
 for(const locale of Object.keys(websiteNames)) {
  assert.equal(websiteNames[locale].length,19);
  for(const value of Object.values(pricingCopy(locale))) assert.ok(value?.length);
 }
});
