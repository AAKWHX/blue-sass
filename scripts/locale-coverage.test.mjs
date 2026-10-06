import test from "node:test";
import assert from "node:assert/strict";
import { load } from "./test-typescript-loader.mjs";
const { locales, extraLocales, localeMeta } = load("lib/i18n/config.ts");
const { extraLexicons, localizeForLocale } = load("lib/i18n/extra-locales.ts");
const { dictionaries } = load("lib/i18n/index.ts");
const { quoteReturnPath } = load("lib/auth/return-path.ts");
const { serviceCatalog } = load("lib/service-catalog.ts");
const { subscriptionPlans } = load("lib/subscriptions.ts");

test("15 locales have flags, full dictionary shape and safe return paths", () => {
  assert.equal(locales.length, 15);
  function shape(value) {
    return value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item)])) : typeof value;
  }
  for (const locale of locales) {
    assert.ok(localeMeta[locale].native && localeMeta[locale].flag);
    assert.deepEqual(shape(dictionaries[locale]), shape(dictionaries.en));
    assert.equal(quoteReturnPath(`/${locale}/quote?kind=landing&type=web`, locale), `/${locale}/quote?type=web&kind=landing`);
    assert.equal(serviceCatalog(locale).length, 8);
    for (const item of serviceCatalog(locale)) assert.ok(item.title && item.description && item.features.length);
    for (const item of subscriptionPlans(locale)) { assert.ok(item.name && item.description && item.features.length && item.limits.reports && item.limits.sites); assert.equal("hours" in item, false); }
  }
});

test("eight static dictionaries preserve placeholders and contain no tokenizer artifacts", () => {
  const source = Object.keys(extraLexicons.it).sort();
  assert.ok(source.length >= 836, "complete static phrase catalog");
  const placeholders = value => (value.match(/\{[^{}]+\}/g) || []).sort();
  for (const locale of extraLocales) {
    assert.deepEqual(Object.keys(extraLexicons[locale]).sort(), source, `${locale}: matching phrase catalog`);
    for (const phrase of source) {
      const translated = extraLexicons[locale][phrase];
      assert.ok(translated?.trim(), `${locale}: ${phrase}`);
      assert.ok(!translated.includes("▁"), `${locale}: token artifacts`);
      assert.deepEqual(placeholders(translated), placeholders(phrase), `${locale}: ${phrase}`);
      assert.equal((translated.match(/\|/g) || []).length, (phrase.match(/\|/g) || []).length, `${locale}: structural delimiters`);
    }
    assert.equal(localizeForLocale("Blue Sass", locale), "Blue Sass");
    assert.notEqual(dictionaries[locale].nav.home, "Home");
  }
});
