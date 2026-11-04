import test from "node:test";
import assert from "node:assert/strict";
import { load } from "./test-typescript-loader.mjs";
const { seedConfiguration, assertSeedDatabaseIdentity } = load("lib/seed-policy.ts");
// Synthetic credentials, never used to connect.
const fixture = { SEED_DATABASE_CONFIRMATION: "isolated-demo-database", SEED_DATABASE_URL: "postgresql://bluesass_seed:fixture@127.0.0.1:55432/bluesass_seed_test", SEED_ADMIN_EMAIL: "fixture@example.invalid", SEED_ADMIN_PASSWORD: "fixture-only!7d9a2Q6m" };
test("demo seeds require explicit isolated database acknowledgement and credentials", () => {
  for (const env of [{}, { ...fixture, SEED_DATABASE_CONFIRMATION: "" }, { ...fixture, SEED_ADMIN_EMAIL: "" }, { ...fixture, SEED_ADMIN_PASSWORD: "" }, { ...fixture, SEED_ADMIN_PASSWORD: "short" }]) assert.throws(() => seedConfiguration(env));
  assert.equal(seedConfiguration(fixture).email, "fixture@example.invalid");
});
test("demo seeds refuse production and every Vercel environment", () => {
  assert.throws(() => seedConfiguration({ ...fixture, NODE_ENV: "production" }), /ISOLATED_DATABASE/);
  assert.throws(() => seedConfiguration({ ...fixture, VERCEL: "1" }), /ISOLATED_DATABASE/);
  for (const key of ["VERCEL", "VERCEL_ENV", "VERCEL_URL", "DEPLOYMENT_URL", "NETLIFY", "RENDER", "CI"]) {
    assert.throws(() => seedConfiguration({ ...fixture, [key]: "" }), /ISOLATED_DATABASE/);
  }
});
test.skip("QA: excluded seed source inspection is NOT TESTED", () => {});
test("seed requires a pinned local target; confirmation cannot bless a remote DATABASE_URL", () => {
  const base = fixture.SEED_DATABASE_URL;
  for (const url of [undefined, "", "invalid", base.replace("127.0.0.1", "db.example.invalid"), base.replace("127.0.0.1", "localhost"), base.replace("55432", "5432"), base.replace("bluesass_seed_test", "postgres"), base.replace("bluesass_seed:", "postgres:"), base + "?host=db.example.invalid", base + "#fragment", base.replace("postgresql:", "https:")]) {
    assert.throws(() => seedConfiguration({ ...fixture, DATABASE_URL: base, SEED_DATABASE_URL: url }), /LOCAL_TARGET/);
  }
  assert.throws(() => seedConfiguration({ ...fixture, SEED_ADMIN_EMAIL: "owner@example.com" }), /EXPLICIT_CREDENTIALS/);
});
test("database marker, role, privilege and empty state must all match before fixture writes", () => {
  const identity = { database_name: "bluesass_seed_test", role_name: "bluesass_seed", marker: "blue-sass:disposable-seed:v1", privileged: false, empty: true };
  assert.doesNotThrow(() => assertSeedDatabaseIdentity(identity));
  for (const change of [{ database_name: "postgres" }, { role_name: "postgres" }, { marker: null }, { privileged: true }, { empty: false }]) {
    assert.throws(() => assertSeedDatabaseIdentity({ ...identity, ...change }), /IDENTITY_REJECTED/);
  }
});
