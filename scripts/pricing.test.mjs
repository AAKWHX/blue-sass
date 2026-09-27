import test from "node:test";
import assert from "node:assert/strict";
import { estimate, applyImplementationDiscount } from "../lib/pricing.ts";
import { websitePackages, websiteNames } from "../lib/website-packages.ts";
import { pricingCopy } from "../lib/i18n/pricing-copy.ts";
import { quoteReturnPath } from "../lib/auth/return-path.ts";
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
 assert.equal(extra.baseLow,pack.low+650);
 assert.equal(extra.discount,extra.baseLow-extra.low);
});
test("discount does not stack with the flexible schedule", () => {
 const pack=websitePackages[0];
 assert.equal(estimate(pack.type,[],"relaxed",pack).low,531);
 assert.equal(estimate(pack.type,[],"standard",pack).low,531);
});
test("all seven languages contain every package and pricing label", () => {
 for(const locale of Object.keys(websiteNames)) {
  assert.equal(websiteNames[locale].length,19);
  for(const value of Object.values(pricingCopy(locale))) assert.ok(value?.length);
 }
});
