import test from "node:test";
import assert from "node:assert/strict";
import { load } from "./test-typescript-loader.mjs";
const { hasCapability, validCapabilities, canOpenAdmin } = load("lib/capabilities.ts");
const { canChangeAccount, canAcceptInvitation } = load("lib/staff-policy.ts");



test("role labels never confer permissions and ownership cannot be delegated", () => {
  assert.equal(hasCapability({ isOwner: false, permissions: [], role: "super_admin" }, "billing.approve"), false);
  assert.equal(canOpenAdmin({ isOwner: false, permissions: [] }), false);
  assert.equal(hasCapability({ isOwner: true, permissions: [] }, "billing.approve"), true);
  assert.equal(hasCapability({ isOwner: false, permissions: ["projects.edit_assigned"] }, "projects.edit_all"), false);
  assert.equal(validCapabilities(["accounts.manage"]), false);
  assert.equal(validCapabilities(["leads.read", "leads.read"]), false);
  assert.equal(canChangeAccount("owner", "owner", "owner"), false);
  assert.equal(canChangeAccount("delegate", "member", "owner"), false);
  assert.equal(canChangeAccount("owner", "member", "owner"), true);
});
test("staff invitation acceptance binds identity, expiry, creator and replay state", () => {
  const now = new Date();
  const valid = { email: "member@example.com", invitationEmail: "member@example.com", expiresAt: new Date(now.getTime() + 60_000), acceptedAt: null, revokedAt: null, creatorId: "owner", ownerId: "owner", permissions: ["projects.read_assigned"] };
  assert.equal(canAcceptInvitation(valid, now), true);
  for (const change of [{ email: "other@example.com" }, { expiresAt: now }, { acceptedAt: now }, { revokedAt: now }, { creatorId: "delegate" }, { permissions: ["accounts.manage"] }]) assert.equal(canAcceptInvitation({ ...valid, ...change }, now), false);
});



