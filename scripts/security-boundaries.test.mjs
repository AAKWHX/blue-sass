import test from "node:test";
import assert from "node:assert/strict";
import { load } from "./test-typescript-loader.mjs";

const { assertSameOrigin } = load("lib/api-security.ts");
const { takeRateLimit } = load("lib/rate-limit.ts");

test("payment requests reject missing, foreign and cross-site origins", () => {
  const request = (headers) => new Request("https://www.bluesass.nl/api/paypal/orders", { method: "POST", headers });
  assert.doesNotThrow(() => assertSameOrigin(request({ origin: "https://www.bluesass.nl", "sec-fetch-site": "same-origin" })));
  for (const headers of [{}, { origin: "https://attacker.example" }, { origin: "https://www.bluesass.nl", "sec-fetch-site": "cross-site" }]) {
    assert.throws(() => assertSameOrigin(request(headers)), /UNTRUSTED_ORIGIN/);
  }
});

test("shared limiter fails closed when its store or signing secret is not configured", async () => {
  assert.equal(await takeRateLimit("security-test:first", 2, 60_000), false);
  assert.equal(await takeRateLimit("security-test:invalid", 0, 60_000), false);
});

test("self-hosted origin uses actual Host authority without trusting forwarded hosts", () => {
  const request = headers => new Request("http://localhost:3021/api/tools/scan", { method: "POST", headers });
  assert.doesNotThrow(() => assertSameOrigin(request({ host: "127.0.0.1:3021", origin: "http://127.0.0.1:3021", "sec-fetch-site": "same-origin" })));
  for (const headers of [
    { host: "127.0.0.1:3021", origin: "https://attacker.example" },
    { host: "127.0.0.1:3021", origin: "https://127.0.0.1:3021" },
    { host: "127.0.0.1:3021", origin: "http://127.0.0.1:3022" },
    { host: "127.0.0.1:3021", origin: "http://127.0.0.1:3021", "sec-fetch-site": "cross-site" },
    { host: "localhost:3021", origin: "https://attacker.example", "x-forwarded-host": "attacker.example" },
    { host: "attacker.example/path", origin: "http://attacker.example" },
    { host: "public.example", origin: "http://localhost:3021" },
  ]) assert.throws(() => assertSameOrigin(request(headers)), /UNTRUSTED_ORIGIN/);
});
