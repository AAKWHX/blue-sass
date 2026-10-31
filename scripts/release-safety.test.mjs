// Static release-safety checks. Reads source files only: no network, no database,
// no child processes. Run with: node --test scripts/release-safety.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));

test("build lifecycle hooks have no database, provider or remote side effects", () => {
  const hooks = ["preinstall", "install", "postinstall", "prepare", "prebuild", "build", "postbuild", "vercel-build"];
  const forbidden = /apply-.*migration|configure-paypal|verify-ai-gateway|drizzle-kit|seed|db:|paypal:|ai:/;
  for (const name of hooks) {
    const command = pkg.scripts[name];
    if (command) assert.ok(!forbidden.test(command), `${name} must not run migrations/provider operations: ${command}`);
  }
});

test("migration and provider operations stay available as explicit commands", () => {
  assert.ok(pkg.scripts["db:migrate"]?.includes("apply-business-migration.mjs"));
  assert.ok(pkg.scripts["paypal:setup"]?.includes("configure-paypal-webhook.mjs"));
  assert.ok(pkg.scripts["ai:verify"]?.includes("verify-ai-gateway.mjs"));
});

test("seed script has no built-in credentials and requires explicit disposable-db confirmation", () => {
  const seed = readFileSync("scripts/seed.ts", "utf8");
  assert.ok(seed.includes("SEED_CONFIRM_DISPOSABLE_DB"));
  assert.ok(!/ClientDemo|ChangeMe!/.test(seed));
  assert.ok(!/console\.log\([^)]*adminPassword/.test(seed));
});

test("production email origin never falls back to request headers", () => {
  const source = readFileSync("lib/site-url.ts", "utf8");
  const guard = source.indexOf('NODE_ENV === "production"');
  const headerRead = source.indexOf("await headers()");
  assert.ok(guard > -1 && headerRead > guard, "production guard must precede header fallback");
});

test("security-patched dependency versions are pinned", () => {
  assert.equal(pkg.dependencies.next, "16.4.3");
  assert.equal(pkg.dependencies.zod, "4.6.6");
  assert.equal(pkg.devDependencies["eslint-config-next"], "16.4.3");
  assert.equal(pkg.overrides.undici, "7.30.1");
});
