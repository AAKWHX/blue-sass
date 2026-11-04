import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { openSync } from "fontkit";
import { load } from "./test-typescript-loader.mjs";

const { locales, defaultLocale, getDir } = load("lib/i18n/config.ts");
const { pageMetadata } = load("lib/page-metadata.ts");
const { publicPageKeys, publicPageMetadata } = load("lib/i18n/seo.ts");
const { indexablePublicPaths } = load("lib/seo-public-paths.ts");
const sitemap = load("app/sitemap.ts").default;

test("retired discovery, comparison, portfolio and template pages are absent from sitemap", () => {
 for (const path of ["/discover", "/compare", "/projects", "/templates"]) {
  assert.ok(!indexablePublicPaths.includes(path));
  for (const locale of locales) assert.ok(!sitemap().some(entry => entry.url === `https://www.bluesass.nl/${locale}${path}`));
 }
});

test("every sitemap URL has reciprocal same-page alternates and a real indexable route", () => {
 const entries = sitemap();
 assert.equal(entries.length, new Set(entries.map(entry => entry.url)).size);
 assert.ok(entries.length < 1000);
 for (const path of indexablePublicPaths) {
  const route = path.startsWith("/templates/") ? "/templates/[slug]" : path.startsWith("/tools/") && path !== "/tools/message-checker" ? "/tools/[tool]" : path.startsWith("/services/") && !["/services/company", "/services/apps", "/services/systems"].includes(path) ? "/services/[service]" : path;
  assert.ok(existsSync(`app/[locale]${route}/page.tsx`), path);
 }
 for (const entry of entries) {
  assert.equal(entry.lastModified, undefined, "do not fabricate edit dates");
  assert.doesNotMatch(entry.url, /\/(admin|portal|login|register|verify|forgot-password|hosting|audit|shared-report|previews|quote|create-project|pricing|template-demo)(\/|$)/);
  const url = new URL(entry.url); const [locale, ...parts] = url.pathname.slice(1).split("/"); const path = parts.length ? `/${parts.join("/")}` : "";
  const metadata = pageMetadata(locale, path, "title", "description");
  assert.equal(metadata.alternates.canonical, url.pathname);
  for (const language of [...locales, "x-default"]) assert.equal(entry.alternates.languages[language], `https://www.bluesass.nl${metadata.alternates.languages[language]}`);
  assert.equal(metadata.alternates.languages["x-default"], `/${defaultLocale}${path}`);
 }
});

test("public metadata covers all locales and preserves Arabic, Dutch and English copy", () => {
 for (const locale of locales) for (const key of publicPageKeys) {
  const metadata = publicPageMetadata(locale, key, key === "home" ? "" : `/${key}`);
  assert.ok(metadata.title.absolute.length > 5);
  assert.ok(metadata.description.length > 20);
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  if (locale === "ar") assert.match(metadata.description, /[\u0600-\u06ff]/);
  if (["nl", "en"].includes(locale)) assert.doesNotMatch(`${metadata.title.absolute}${metadata.description}`, /[\u0600-\u06ff]/);
 }
 assert.equal(getDir("ar"), "rtl"); assert.equal(getDir("nl"), "ltr");
 assert.deepEqual(publicPageMetadata("invalid", "home", ""), {});
});

test("redirect aliases retain their routes and target the services canonical", () => {
 for (const alias of ["pricing"]) {
  const source = readFileSync(`app/[locale]/${alias}/page.tsx`, "utf8");
  assert.ok(source.includes("/services"));
  assert.ok(!source.includes(`services#${alias}`));
  assert.ok(source.includes('"services", "/services"'));
  assert.ok(!indexablePublicPaths.includes(`/${alias}`));
 }
 assert.ok(!readFileSync("app/[locale]/layout.tsx", "utf8").includes("canonical:"), "layout must not leak a home canonical");
});

test("QA lifecycle stays blocked and public runtime remains isolated", () => {
 const { scripts } = JSON.parse(readFileSync("package.json", "utf8"));
 assert.equal(scripts.prebuild, "node qa/block-execution.mjs");
 assert.equal(scripts.build, "node qa/block-execution.mjs");
 assert.equal(scripts.postbuild, undefined);
 assert.ok(scripts["db:migrate"] && scripts["paypal:setup"] && scripts["ai:verify"]);
 const runner = readFileSync("scripts/next-with-dist.mjs", "utf8");
 assert.match(runner, /QA_|L2_B1/);
 const publicRuntime = readFileSync("qa/final-local-20261025/public-runtime.cjs", "utf8");
 assert.ok(publicRuntime.includes("network-seal.cjs"));
 assert.doesNotMatch(publicRuntime, /\.\.\.process\.env/);
 assert.equal(scripts["db:migrate"], "node qa/block-execution.mjs");
 const config = readFileSync("next.config.mjs", "utf8");
 assert.ok(config.includes('"@": dirname') && config.includes("resolveAlias"));
});

test("legacy service redirects preserve locale and destination before page rendering", async () => {
 const config = (await import("../next.config.mjs")).default;
 const redirects = await config.redirects();
 assert.equal(redirects.length, 5);
 assert.ok(!redirects.some(row => row.source.endsWith("/templates") || row.source.endsWith("/previews/:path*")));
 for (const path of ["pricing"]) {
  const retired = redirects.find(row => row.source.endsWith(`/${path}`));
  assert.equal(retired.destination, "/:locale/services");
  assert.equal(retired.permanent, true);
 }
 for (const [alias, target] of Object.entries({ mobile: "android", cloud: "erp", security: "web" })) {
  const rule = redirects.find(row => row.source.endsWith(`/services/${alias}`));
  assert.equal(rule.destination, `/:locale/services/${target}`);
  assert.equal(rule.permanent, true);
  for (const locale of locales) assert.ok(rule.source.includes(locale));
 }
});

test("local IBM Plex files retain verified family, weights, integrity, shaping and license", () => {
 const dir = "public/fonts/ibm-plex-sans-arabic/";
 const manifest = JSON.parse(readFileSync(`${dir}provenance.json`, "utf8"));
 assert.equal(manifest.files.length, 16);
 assert.match(readFileSync(`${dir}OFL.txt`, "utf8"), /SIL OPEN FONT LICENSE Version 1\.1/);
 const css = readFileSync("app/fonts/ibm-plex-sans-arabic.css", "utf8");
 assert.equal((css.match(/unicode-range:/g) ?? []).length, 16);
 assert.doesNotMatch(css, /https?:\/\//);
 const arabicWeights = new Set();
 for (const row of manifest.files) {
  assert.equal(createHash("sha256").update(readFileSync(dir + row.file)).digest("hex"), row.sha256);
  const font = openSync(dir + row.file);
  assert.ok(font.familyName.startsWith("IBM Plex Sans Arabic"));
  assert.equal(font["OS/2"].usWeightClass, row.weight);
  if (font.hasGlyphForCodePoint(0x0633)) {
   arabicWeights.add(row.weight);
   assert.ok(font.layout("السلام عليكم").glyphs.length > 0);
  }
 }
 assert.deepEqual([...arabicWeights].sort(), [400, 500, 600, 700]);
 assert.doesNotMatch(readFileSync("lib/fonts.ts", "utf8"), /next\/font\/google/);
});
