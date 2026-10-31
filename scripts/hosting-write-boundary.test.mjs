import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { load } from "./test-typescript-loader.mjs";

const accessModule = { exports: {} };
const accessSource = ts.transpileModule(readFileSync("lib/db/access.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
new Function("require", "module", "exports", accessSource)(name => {
  if (name === "react") return { cache: fn => fn };
  if (name === "@/lib/capabilities") return load("lib/capabilities.ts");
  return {};
}, accessModule, accessModule.exports);
const { assertCanWrite, AuthorisationError } = accessModule.exports;
const { assertSameOrigin } = load("lib/api-security.ts");

// Execute the actual route with external boundaries replaced by tripwires.
// No database, provider or production account is touched.
function route(path, email, reached) {
  const compiled = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const forbidden = new Proxy({}, { get() { reached.push("database"); throw Error("UNEXPECTED_DATABASE_ACCESS"); } });
  const dependencies = {
    "next/server": { NextResponse: { json: (data, init) => Response.json(data, init) } },
    "drizzle-orm": { eq() {}, and() {} },
    "@/lib/db": { isDatabaseConfigured: true, db: forbidden },
    "@/lib/db/schema": {},
    "@/lib/db/access": { AuthorisationError, assertCanWrite, requireViewer: async () => ({ id: "fixture-user", email }) },
    "@/lib/api-security": { assertSameOrigin },
    "@/lib/rate-limit": { takeRateLimit: async () => { reached.push("rate-limit"); return false; } },
    "@/lib/db/hosting-entitlement": { hasHostingSubscription: async () => { reached.push("entitlement"); return false; } },
    "@/lib/hosting/vercel": new Proxy({}, { get() { return () => { reached.push("provider"); throw Error("UNEXPECTED_PROVIDER_ACCESS"); }; } }),
  };
  const routeModule = { exports: {} };
  new Function("require", "module", "exports", compiled)(name => {
    assert.ok(name in dependencies, `Unexpected import ${name}`);
    return dependencies[name];
  }, routeModule, routeModule.exports);
  return routeModule.exports.POST;
}

for (const path of ["app/api/hosting/deploy/route.ts", "app/api/hosting/sites/[id]/refresh/route.ts"]) {
  test(`${path}: read-only assistant cannot cause hosting writes`, async () => {
    const reached = [];
    const post = route(path, "AL3RAB@BLUESASS.NL", reached);
    const response = await post(new Request("https://fixture.example/api/hosting", { method: "POST", headers: { origin: "https://fixture.example" } }), { params: Promise.resolve({ id: "fixture" }) });
    assert.equal(response.status, 401);
    assert.deepEqual(reached, []);
  });
  test(`${path}: ordinary client still reaches its existing entitlement or rate-limit gate`, async () => {
    const reached = [];
    const post = route(path, "fixture-client@example.com", reached);
    const response = await post(new Request("https://fixture.example/api/hosting", { method: "POST", headers: { origin: "https://fixture.example" } }), { params: Promise.resolve({ id: "fixture" }) });
    assert.ok([402, 429].includes(response.status));
    assert.equal(reached.length, 1);
    assert.ok(["entitlement", "rate-limit"].includes(reached[0]));
  });
}
