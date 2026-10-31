import test from "node:test";
import assert from "node:assert/strict";
import { load } from "./test-typescript-loader.mjs";
const { locales, retiredLocales, isLocale } = load("lib/i18n/config.ts");
const { serviceSlugs, serviceCatalog } = load("lib/service-catalog.ts");
const { creationService, creationLayouts } = load("lib/i18n/creation.ts");
const { homePlatformCopy } = load("lib/i18n/home-platform.ts");

test("all creation paths have distinct content and layouts in the three active languages", () => {
  assert.deepEqual(locales, ["ar", "en", "nl"]);
  assert.equal(new Set(Object.values(creationLayouts)).size, 8);
  for (const locale of locales) {
    const journeys = serviceSlugs.map((slug, index) => {
      const copy = creationService(locale, index);
      assert.ok(copy.title.length > 5 && copy.description.length > 40, `${locale}/${slug}`);
      assert.equal(copy.steps.length, 4); assert.equal(copy.benefits.length, 3);
      assert.equal(serviceCatalog(locale)[index].title, copy.title);
      return copy.steps.join("|");
    });
    assert.equal(new Set(journeys).size, 8);
    assert.equal(homePlatformCopy(locale).tools.length, 4);
    for (const tool of homePlatformCopy(locale).tools) assert.ok(tool.split("|")[1].length > 30);
  }
});

test("retired language links have permanent path-preserving redirects and are not active locales", async () => {
  const { default: config } = await import("../next.config.mjs");
  const rules = await config.redirects();
  const retirement = rules.find(rule => rule.destination === "/en/:path*");
  assert.ok(retirement?.permanent);
  for (const locale of retiredLocales) { assert.equal(isLocale(locale), false); assert.ok(retirement.source.includes(locale)); }
});
