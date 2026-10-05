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

test("attempt limiter blocks excess attempts independently for each identity", () => {
  assert.equal(takeRateLimit("security-test:first", 2, 60_000), true);
  assert.equal(takeRateLimit("security-test:first", 2, 60_000), true);
  assert.equal(takeRateLimit("security-test:first", 2, 60_000), false);
  assert.equal(takeRateLimit("security-test:second", 2, 60_000), true);
});
