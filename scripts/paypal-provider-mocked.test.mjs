import test from "node:test";
import assert from "node:assert/strict";
import { load } from "./test-typescript-loader.mjs";
const paypal = load("lib/paypal.ts");

test("provider environment rejects prototype keys and client readiness stays false", () => {
 const old = process.env.PAYPAL_ENV;
 try { for (const value of ["toString", "constructor", "__proto__", "unknown"]) { process.env.PAYPAL_ENV = value; assert.throws(() => paypal.getPayPalEnvironment(), /sandbox or live/); assert.equal(paypal.getPayPalClientConfig().configured, false); } }
 finally { if (old === undefined) delete process.env.PAYPAL_ENV; else process.env.PAYPAL_ENV = old; }
});

test("invalid webhook certificate headers fail closed without making provider calls", async () => {
 const originalFetch = globalThis.fetch; let calls = 0;
 globalThis.fetch = async () => { calls++; throw Error("No network permitted"); };
 try {
  for (const url of ["not a URL", "http://api.paypal.com/v1/notifications/certs/x", "https://attacker.example/v1/notifications/certs/x", "https://api.paypal.com/other", "https://user:pass@api.paypal.com/v1/notifications/certs/x"]) {
   const headers = new Headers({ "paypal-auth-algo": "SHA256withRSA", "paypal-cert-url": url, "paypal-transmission-id": "demo", "paypal-transmission-sig": "demo", "paypal-transmission-time": "2026-10-18T00:00:00Z" });
   assert.equal(await paypal.verifyPayPalWebhook("{}", headers), false);
  }
  assert.equal(calls, 0);
 } finally { globalThis.fetch = originalFetch; }
});

test("signature verification and already-captured retries use mocked provider responses and stable idempotency keys", async () => {
 const keys = ["PAYPAL_ENV", "PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_WEBHOOK_ID"]; const previous = Object.fromEntries(keys.map(k => [k, process.env[k]]));
 Object.assign(process.env, { PAYPAL_ENV: "sandbox", PAYPAL_CLIENT_ID: "local-dummy", PAYPAL_CLIENT_SECRET: "local-dummy", PAYPAL_WEBHOOK_ID: "DEMO-WEBHOOK" });
 const originalFetch = globalThis.fetch; const calls = [];
 globalThis.fetch = async (url, init) => {
  calls.push({ url, init });
  if (url.endsWith("/v1/oauth2/token")) return Response.json({ access_token: "local-dummy-token" });
  if (url.endsWith("/verify-webhook-signature")) { const body = JSON.parse(init.body); assert.deepEqual(body.webhook_event, { id: "DEMO-EVENT" }); assert.equal(body.webhook_id, "DEMO-WEBHOOK"); return Response.json({ verification_status: "SUCCESS" }); }
  if (url.endsWith("/capture")) return Response.json({ details: [{ issue: "ORDER_ALREADY_CAPTURED" }] }, { status: 422 });
  if (url.endsWith("/v2/checkout/orders/DEMO-ORDER")) return Response.json({ id: "DEMO-ORDER", status: "COMPLETED" });
  throw Error("Unexpected mocked provider path");
 };
 try {
  const headers = new Headers({ "paypal-auth-algo": "SHA256withRSA", "paypal-cert-url": "https://api.sandbox.paypal.com/v1/notifications/certs/demo", "paypal-transmission-id": "demo", "paypal-transmission-sig": "demo", "paypal-transmission-time": "2026-10-18T00:00:00Z" });
  assert.equal(await paypal.verifyPayPalWebhook('{"id":"DEMO-EVENT"}', headers), true);
  assert.equal((await paypal.capturePayPalOrder("DEMO-ORDER", "DEMO-PAYMENT", 2)).status, "COMPLETED");
  assert.equal(calls.find(call => call.url.endsWith("/capture")).init.headers["PayPal-Request-Id"], "DEMO-PAYMENT-capture-2");
  assert.ok(calls.every(call => call.url.startsWith("https://api-m.sandbox.paypal.com/")));
 } finally { globalThis.fetch = originalFetch; for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; } }
});
