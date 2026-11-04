import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import { load } from "./test-typescript-loader.mjs";
const nativeRequire = createRequire(import.meta.url);

function provider(record, compareResult = false) {
  let configuration;
  const compares = [];
  class CredentialsSignin extends Error {}
  const query = { select: () => query, from: () => query, where: () => query, limit: async () => record ? [record] : [] };
  const dependencies = {
    "next-auth": { __esModule: true, default: value => { configuration = value; return {}; }, CredentialsSignin },
    "next-auth/providers/credentials": { __esModule: true, default: value => value },
    "next-auth/providers/google": { __esModule: true, default: () => ({}) },
    "@auth/drizzle-adapter": { DrizzleAdapter: () => ({}) },
    "drizzle-orm": { eq: () => ({}), sql: () => ({}) },
    "bcryptjs": { __esModule: true, default: { compare: async (password, hash) => { compares.push({ password, hash }); return compareResult; } } },
    "@/lib/db": { db: query, isDatabaseConfigured: true },
    "@/lib/db/schema": { users: { email: {} } },
    "@/lib/auth/policy": { requireEmailVerification: true },
    "@/lib/rate-limit": { takeRateLimit: async () => true, requestIdentity: () => "isolated-fixture" },
    "@/lib/db/google-identity": { validateGoogleAccountLink: async () => false },
  };
  const compiled = { exports: {} };
  const source = ts.transpileModule(readFileSync("lib/auth.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  new Function("require", "module", "exports", "process", source)(name => name in dependencies ? dependencies[name] : name.startsWith("@/") ? load(name.slice(2) + ".ts") : nativeRequire(name), compiled, compiled.exports, { env: {} });
  return { authorize: configuration.providers[0].authorize, compares };
}

test("unknown and OAuth-only accounts still perform cost-12 bcrypt work and cannot sign in", async () => {
  for (const record of [null, { id: "fixture", passwordHash: null }]) {
    const fixture = provider(record, true);
    assert.equal(await fixture.authorize({ email: "fixture@example.invalid", password: "fixture-only-password" }, { headers: new Headers() }), null);
    assert.equal(fixture.compares.length, 1);
    assert.match(fixture.compares[0].hash, /^\$2b\$12\$/);
  }
});
test("disabled accounts and invalid passwords remain rejected after bcrypt work", async () => {
  for (const change of [{ disabledAt: new Date(), valid: true }, { disabledAt: null, valid: false }]) {
    const record = { id: "fixture", passwordHash: "fixture-hash", disabledAt: change.disabledAt };
    const fixture = provider(record, change.valid);
    assert.equal(await fixture.authorize({ email: "fixture@example.invalid", password: "fixture-only-password" }, { headers: new Headers() }), null);
    assert.equal(fixture.compares.length, 1);
  }
});
test("valid verified fixture retains the existing provider result", async () => {
  const fixture = provider({ id: "fixture", email: "fixture@example.invalid", passwordHash: "fixture-hash", disabledAt: null, emailVerified: new Date(), role: "client", locale: "nl" }, true);
  const result = await fixture.authorize({ email: "fixture@example.invalid", password: "fixture-only-password" }, { headers: new Headers() });
  assert.equal(result.id, "fixture");
  assert.equal(result.role, "client");
  assert.equal(result.locale, "nl");
});
