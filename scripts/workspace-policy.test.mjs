import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { load } from "./test-typescript-loader.mjs";
const { mayEditAgreement, mayAcceptAgreement } = load("lib/project-agreement.ts");
const { credentialRevision } = load("lib/auth/credential-revision.ts");
test("offers lock after payment reservation, design, cancellation or permanent lock", () => {
  const input = { stage: "planning", cancelled: false, locked: false, hasPayment: false };
  assert.equal(mayEditAgreement(input), true);
  for (const change of [{ stage: "design" }, { cancelled: true }, { locked: true }, { hasPayment: true }]) assert.equal(mayEditAgreement({ ...input, ...change }), false);
});
test("scope acceptance binds client, current version and management-approved price", () => {
  const valid = { clientId: "client", viewerId: "client", version: 2, submittedVersion: 2, priceCents: 20000, approvedPriceCents: 20000, cancelled: false };
  assert.equal(mayAcceptAgreement(valid), true);
  for (const change of [{ viewerId: "employee" }, { submittedVersion: 1 }, { priceCents: null }, { approvedPriceCents: 21000 }, { cancelled: true }]) assert.equal(mayAcceptAgreement({ ...valid, ...change }), false);
});
test("suspension and restoration revoke prior sessions without breaking version-zero sessions", () => {
  assert.equal(credentialRevision("test-hash", 0), createHash("sha256").update("test-hash").digest("hex"));
  assert.notEqual(credentialRevision("test-hash", 0), credentialRevision("test-hash", 1));
  assert.notEqual(credentialRevision("test-hash", 1), credentialRevision("test-hash", 2));
});
