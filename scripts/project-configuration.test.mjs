import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const nativeRequire = createRequire(import.meta.url);
const cache = new Map();
function load(path) {
  const file = resolve(path);
  if (cache.has(file)) return cache.get(file);
  const compiled = { exports: {} };
  cache.set(file, compiled.exports);
  const source = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const require = spec => spec.startsWith("@/") ? load(`${spec.slice(2)}.ts`) : spec.startsWith(".") ? load(resolve(dirname(file), `${spec.replace(/\.ts$/, "")}.ts`)) : nativeRequire(spec);
  new Function("require", "module", "exports", source)(require, compiled, compiled.exports);
  cache.set(file, compiled.exports);
  return compiled.exports;
}
const { projectOptions, initialConfiguration, configuredEstimate, extraOptions, providerOptions, moduleOptions, performanceOptions } = load("lib/project-options.ts");
const { configurationSchema } = load("lib/validation/project-configuration.ts");
const { builderCopy } = load("lib/i18n/project-builder.ts");
const { installmentSchedule } = load("lib/installments.ts");
test("installments allocate 100% exactly, including cent rounding", () => {
  for (const cents of [100, 101, 999, 11800, 40567, 100_000_000]) {
    const rows = installmentSchedule(cents);
    assert.equal(rows.length, 6);
    assert.deepEqual(rows.map(row => row.percent), [10, 20, 35, 15, 10, 10]);
    assert.equal(rows.reduce((sum, row) => sum + row.amountCents, 0), cents);
    assert.ok(rows.every(row => Number.isSafeInteger(row.amountCents) && row.amountCents > 0));
  }
  for (const value of [0, 99, -1, 1.5, NaN, Infinity, 100_000_001]) assert.throws(() => installmentSchedule(value));
});
test("60% lower price book preserves the previous price book", () => {
  assert.equal(projectOptions.find(p => p.id === "landing").price, 118);
  const c = valid("landing");
  const current = configuredEstimate(c);
  const previous = configuredEstimate({ ...c, priceVersion: 1 });
  assert.equal(previous.baseLow, 295);
  assert.equal(current.baseLow, 118);
});
function valid(kind = "company") {
  const c = initialConfiguration("web", kind);
  c.name = "Test Client"; c.projectName = "Test Project";
  c.deliveryDays = configuredEstimate(c).minimumDays;
  return c;
}
test("34 unique project types have valid scope, price and translations", () => {
  assert.equal(projectOptions.length, 34);
  assert.equal(new Set(projectOptions.map(p => p.id)).size, 34);
  for (const p of projectOptions) {
    const c = valid(p.id);
    assert.equal(configurationSchema.safeParse(c).success, true, p.id);
    const result = configuredEstimate(c);
    assert.ok(result.totalLow > 0 && result.totalHigh >= result.totalLow);
    assert.ok(result.minimumDays >= 3);
    assert.equal(Object.values(p.names).filter(Boolean).length, 7);
  }
});
test("all seven locales contain all UI and option labels", () => {
  for (const names of [...Object.values(builderCopy), ...[...extraOptions, ...providerOptions, ...moduleOptions, ...performanceOptions].map(p => p.names)]) assert.equal(Object.values(names).filter(Boolean).length, 7);
});
test("monthly and yearly services never inflate implementation cost", () => {
  const c = valid(); const base = configuredEstimate(c);
  c.extras = ["domain", "email", "hosting", "maintenance"];
  const quote = configuredEstimate(c);
  assert.equal(quote.totalLow, base.totalLow);
  assert.equal(quote.monthly, 53); assert.equal(quote.yearly, 8);
});
test("provider setup is a one-time fee; included auth is not charged twice", () => {
  const c = valid("booking"); const base = configuredEstimate(c);
  c.providers = ["google", "apple", "email-password"];
  const quote = configuredEstimate(c);
  assert.equal(quote.totalLow - base.totalLow, 24);
  assert.equal(quote.monthly, 0);
});
test("one base language is free; extra languages charged once", () => {
  const c = valid(); const base = configuredEstimate(c);
  c.languages = ["ar", "en", "nl"]; c.features.push("i18n");
  assert.equal(configuredEstimate(c).totalLow - base.totalLow, 100);
});
test("rejects incompatible project modules and unknown prices", () => {
  assert.equal(configurationSchema.safeParse({ ...valid("visual-identity"), modules: ["shipping"] }).success, false);
  assert.equal(configurationSchema.safeParse({ ...valid(), extras: ["free-forever"] }).success, false);
  assert.equal(configurationSchema.safeParse({ ...valid(), budget: 1 }).success, false);
});
test("rejects duplicate charges, conflicting subscription tiers and too-short delivery", () => {
  assert.equal(configurationSchema.safeParse({ ...valid(), extras: ["domain", "domain"] }).success, false);
  assert.equal(configurationSchema.safeParse({ ...valid(), extras: ["hosting", "hosting-business"] }).success, false);
  assert.equal(configurationSchema.safeParse({ ...valid("cross-platform"), deliveryDays: 3 }).success, false);
});
test("login providers require auth, extra languages require i18n", () => {
  assert.equal(configurationSchema.safeParse({ ...valid(), providers: ["google"] }).success, false);
  assert.equal(configurationSchema.safeParse({ ...valid(), languages: ["ar", "en"] }).success, false);
});
test("domain validation rejects URLs and scripts", () => {
  assert.equal(configurationSchema.safeParse({ ...valid(), domain: "example.nl" }).success, true);
  for (const domain of ["https://example.nl", "javascript:alert(1)", "bad domain.nl"]) assert.equal(configurationSchema.safeParse({ ...valid(), domain }).success, false);
});
test("included package features cannot be removed", () => {
  assert.equal(configurationSchema.safeParse({ ...valid("booking"), features: [] }).success, false);
});
