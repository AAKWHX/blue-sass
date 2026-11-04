import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import ts from "typescript";

function siteUrl(env, headers) {
  const cache = new Map();
  function load(file) {
    file = resolve(file);
    if (cache.has(file)) return cache.get(file);
    const compiled = { exports: {} };
    cache.set(file, compiled.exports);
    const code = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const require = name => name === "server-only" ? {} : name === "next/headers" ? { headers: async () => new Headers(headers) } : name.startsWith("@/") ? load(name.slice(2) + ".ts") : name.startsWith(".") ? load(resolve(dirname(file), name + ".ts")) : (() => { throw Error("Unexpected dependency"); })();
    new Function("require", "module", "exports", "process", code)(require, compiled, compiled.exports, { env });
    return compiled.exports;
  }
  return load("lib/site-url.ts").getSiteUrl();
}

test("production email links cannot be poisoned through Host or forwarded headers", async () => {
  assert.equal(await siteUrl({ NODE_ENV: "production" }, { host: "attacker.invalid", "x-forwarded-host": "attacker.invalid", "x-forwarded-proto": "http" }), "https://www.bluesass.nl");
});
test("local email links ignore spoofed forwarded headers and keep loopback authority", async () => {
  assert.equal(await siteUrl({ NODE_ENV: "development" }, { host: "127.0.0.1:3022", "x-forwarded-host": "attacker.invalid", "x-forwarded-proto": "https" }), "http://127.0.0.1:3199");
});
test("local email links reject non-loopback request authorities", async () => {
  assert.equal(await siteUrl({ NODE_ENV: "development" }, { host: "attacker.invalid" }), "http://127.0.0.1:3199");
});
test("trusted configured origins retain custom HTTPS domains", async () => {
  assert.equal(await siteUrl({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://www.bluesass.nl/" }, {}), "https://www.bluesass.nl");
});
test("email origins reject credentials, paths, query, fragments and insecure production URLs", async () => {
  for (const value of ["https://unknown.invalid", "https://bluesass.nl.evil.invalid", "https://www.bluesass.nl:444", "https://user:password@bluesass.nl", "https://bluesass.nl/path", "https://bluesass.nl/?next=evil", "https://bluesass.nl/#evil", "http://bluesass.nl", "javascript:alert(1)"]) {
    await assert.rejects(siteUrl({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: value }, {}), /SITE_ORIGIN_INVALID/);
  }
});
test("Vercel hostnames are read from trusted deployment configuration", async () => {
  assert.equal(await siteUrl({ NODE_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "www.bluesass.nl" }, { host: "attacker.invalid" }), "https://www.bluesass.nl");
  const preview = { NODE_ENV: "production", VERCEL: "1", VERCEL_ENV: "preview", VERCEL_URL: "blue-sass-review-genel-tek.vercel.app", BLUE_SASS_VERIFIED_PREVIEW_ORIGIN: "https://blue-sass-review-genel-tek.vercel.app" };
  assert.equal(await siteUrl(preview, { host: "attacker.invalid" }), preview.BLUE_SASS_VERIFIED_PREVIEW_ORIGIN);
  await assert.rejects(siteUrl({ ...preview, BLUE_SASS_VERIFIED_PREVIEW_ORIGIN: undefined }, {}), /SITE_ORIGIN_INVALID/);
  await assert.rejects(siteUrl({ ...preview, VERCEL_URL: "attacker.vercel.app" }, {}), /SITE_ORIGIN_INVALID/);
  await assert.rejects(siteUrl({ NODE_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "attacker.invalid" }, {}), /SITE_ORIGIN_INVALID/);
});
