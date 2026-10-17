import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { load } from "./test-typescript-loader.mjs";
const { locales } = load("lib/i18n/config.ts");
const { toolIds } = load("lib/tools/catalog.ts");
const { serviceSlugs } = load("lib/service-catalog.ts");
const base = process.env.QA_ORIGIN ?? "http://localhost:3000";
const checks = []; const failures = [];
async function check(path, validate) {
  try {
    const response = await fetch(base + path, { redirect: "manual", signal: AbortSignal.timeout(60_000) });
    const html = await response.text();
    await validate(response, html);
    checks.push({ path, status: response.status });
    console.log(`PASS ${path} ${response.status}`);
  } catch (error) { failures.push({ path, error: String(error) }); console.error(`FAIL ${path}: ${error.message}`); }
}
const page = (response, html) => {
  assert.equal(response.status, 200);
  assert.match(html, /<h1[\s>]/);
  assert.doesNotMatch(html, /href="[^"#]*(?:\/previews\/|\/templates(?:\?|"))|href="[^"]*#(?:pricing|templates)"/);
  assert.match(html, /Crafted by/);
};
for (const locale of locales) {
  await check(`/${locale}`, (response, html) => {
    page(response, html);
    assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`));
    assert.match(html, new RegExp(`dir="${locale === "ar" ? "rtl" : "ltr"}"`));
    for (const id of ["subscriptions", "hosting", "tools", "products", "marketplace", "jobs"]) assert.ok(html.includes(`id="home-${id}"`));
    assert.doesNotMatch(html, /id="home-(?:pricing|templates)"|id="inquiry-name"|data-package=/);
    for (const header of ["x-content-type-options", "x-frame-options", "content-security-policy"]) assert.ok(response.headers.has(header));
  });
  for (const path of ["templates", "pricing", "previews/web-1"]) await check(`/${locale}/${path}`, response => {
    assert.equal(response.status,308);
    assert.equal(new URL(response.headers.get("location"),base).pathname,`/${locale}/services`);
  });
}
for (const locale of ["en", "ar", "nl"]) {
  for (const path of ["services", ...serviceSlugs.map(s=>`services/${s}`), "services/company", "services/apps", "services/systems", "projects", "tools", ...toolIds.map(t=>`tools/${t}`), "subscriptions", "products", "jobs", "marketplace", "contact"]) {
    await check(`/${locale}/${path}`, (response,html) => { page(response,html); assert.doesNotMatch(html,/data-package=|id="templates"/); });
  }
  for (const path of ["admin", "portal"]) await check(`/${locale}/${path}`, response => {
    assert.equal(response.status,307);
    assert.equal(new URL(response.headers.get("location"),base).pathname,`/${locale}/login`);
  });
}
await mkdir("artifacts/redesign",{recursive:true});
await writeFile("artifacts/redesign/html-checks.json", JSON.stringify({base,checks,failures,scope:"Rendered HTML checks; not browser interaction tests"},null,2));
assert.equal(failures.length,0,JSON.stringify(failures));
console.log(`${checks.length} rendered route checks passed`);
