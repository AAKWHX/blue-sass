import test from "node:test";
import assert from "node:assert/strict";
import { load } from "./test-typescript-loader.mjs";
const { compactSessionToken } = load("lib/auth/compact-token.ts");
test("inline profile images and provider payloads never enter session cookies", () => {
  const token = { uid: "user-id", sub: "user-id", role: "client", locale: "ar", credentialRevision: "a".repeat(64), picture: "data:image/png;base64," + "A".repeat(1_000_000), providerPayload: "B".repeat(1_000_000), name: "N".repeat(10_000), email: "E".repeat(10_000), company: "C".repeat(10_000), canAdmin: false };
  const compact = compactSessionToken(token);
  assert.equal(compact.uid, token.uid);
  assert.equal(compact.credentialRevision, token.credentialRevision);
  assert.equal(compact.name.length, 80);
  assert.equal(compact.company.length, 120);
  assert.equal(compact.picture, undefined);
  assert.equal(compact.providerPayload, undefined);
  assert.ok(Buffer.byteLength(JSON.stringify(compact), "utf8") < 1500);
  assert.equal(compactSessionToken({ ...token, canAdmin: "true" }).canAdmin, false);
});
