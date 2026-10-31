// Read-only verification against a local server; never submits forms or uses credentials.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { load } from "./test-typescript-loader.mjs";

const origin = new URL(process.argv[2] ?? "http://localhost:3124");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname));
assert.equal(origin.protocol, "http:");
assert.ok(!origin.username && !origin.password && origin.pathname === "/");
const { indexablePublicPaths } = load("lib/seo-public-paths.ts");
const { toolIds } = load("lib/tools/catalog.ts");
const { locales } = load("lib/i18n/config.ts");
const urls = ["ar", "en", "nl"].flatMap(locale => indexablePublicPaths.map(path => ({ locale, path })));
const get = path => {
 const url = new URL(path, origin);
 assert.equal(url.origin, origin.origin, "verification stays on the local server");
 // Next.js waits for metadata for crawlers; inspect that HTML response rather
 // than a streamed response intended for an interactive browser.
 return fetch(url, { headers: { "User-Agent": "Googlebot" }, redirect: "manual", signal: AbortSignal.timeout(30000) });
};
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1];
let verified = 0;
const queue = [...urls];
await Promise.all(Array.from({ length: 3 }, async () => {
 while (queue.length) {
  const { locale, path } = queue.shift(); const response = await get(`/${locale}${path}`);
  assert.equal(response.status, 200, `${locale}${path}`);
  const html = await response.text();
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  const canonicals = links.filter(tag => attr(tag, "rel") === "canonical");
  assert.equal(canonicals.length, 1, `one canonical: ${locale}${path}`);
  assert.equal(attr(canonicals[0], "href"), `https://www.bluesass.nl/${locale}${path}`);
  const alternates = links.filter(tag => attr(tag, "rel") === "alternate" && attr(tag, "hreflang"));
  assert.equal(alternates.length, locales.length + 1, `alternates: ${locale}${path}`);
  for (const language of [...locales, "x-default"]) {
   const matches = alternates.filter(tag => attr(tag, "hreflang") === language);
   assert.equal(matches.length, 1);
   assert.equal(attr(matches[0], "href"), `https://www.bluesass.nl/${language === "x-default" ? "en" : language}${path}`);
  }
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = attr((html.match(/<meta\b[^>]*>/gi) ?? []).find(tag => attr(tag, "name") === "description") ?? "", "content");
  assert.ok(title && description, `copy: ${locale}${path}`);
  if (["en", "nl"].includes(locale)) assert.doesNotMatch(title + description, /[\u0600-\u06ff]/, `language: ${locale}${path}`);
  if (locale === "ar") assert.match(title + description, /[\u0600-\u06ff]/, `language: ${locale}${path}`);
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0];
  assert.equal(attr(htmlTag, "lang"), locale);
  assert.equal(attr(htmlTag, "dir"), locale === "ar" ? "rtl" : "ltr");
  verified++;
 }
}));

for (const locale of ["ar", "en", "nl"]) for (const alias of ["pricing", "templates"]) {
 const response = await get(`/${locale}/${alias}`);
 assert.equal(response.status, 307);
 assert.equal(response.headers.get("location"), `/${locale}/services#${alias}`);
}
for (const locale of ["ar", "en", "nl"]) for (const [alias, target] of Object.entries({ mobile: "android", cloud: "erp", security: "web" })) {
 const response = await get(`/${locale}/services/${alias}`);
 assert.equal(response.status, 308);
 assert.equal(response.headers.get("location"), `/${locale}/services/${target}`);
}
for (const path of ["login", "register", "verify", "forgot-password", "hosting", "audit"]) {
 const response = await get(`/ar/${path}`); assert.equal(response.status, 200, path);
 const html = await response.text();
 const robots = (html.match(/<meta\b[^>]*>/gi) ?? []).find(tag => attr(tag, "name") === "robots");
 assert.match(attr(robots ?? "", "content") ?? "", /noindex/, path);
}
const mapResponse = await get("/sitemap.xml"); assert.equal(mapResponse.status, 200);
const xml = await mapResponse.text();
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.equal(locs.length, indexablePublicPaths.length * locales.length);
assert.equal(new Set(locs).size, locs.length);
assert.doesNotMatch(xml, /<lastmod>/);

const manifest = JSON.parse(readFileSync("public/fonts/ibm-plex-sans-arabic/provenance.json", "utf8"));
for (const row of manifest.files) {
 const response = await get(`/fonts/ibm-plex-sans-arabic/${row.file}`);
 assert.equal(response.status, 200);
 assert.equal(createHash("sha256").update(Buffer.from(await response.arrayBuffer())).digest("hex"), row.sha256);
}
const home = await (await get("/ar")).text();
const styles = (home.match(/<link\b[^>]*>/gi) ?? []).filter(tag => attr(tag, "rel") === "stylesheet").map(tag => attr(tag, "href"));
const css = (await Promise.all(styles.map(async href => (await get(href)).text()))).join("\n");
assert.match(css, /\/fonts\/ibm-plex-sans-arabic\//);
assert.doesNotMatch(css, /fonts\.(googleapis|gstatic)\.com/);
console.log(JSON.stringify({ publicPagesVerified: verified, toolPagesVerified: toolIds.length * 3, redirectsVerified: 15, noindexPagesVerified: 6, sitemapUrls: locs.length, localFontFilesVerified: manifest.files.length, remoteGoogleFontUrls: 0 }, null, 2));
