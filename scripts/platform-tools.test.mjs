import test from "node:test";
import assert from "node:assert/strict";
import { load } from "./test-typescript-loader.mjs";
const { hasCapability, validCapabilities, canOpenAdmin } = load("lib/capabilities.ts");
const { canChangeAccount, canAcceptInvitation } = load("lib/staff-policy.ts");
const { isPublicAddress, auditUrl } = load("lib/audits/network.ts");
const { analyzeSourceFiles, allowedSourcePath, analyzeHtml } = load("lib/audits/analyze.ts");

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
test("scanner blocks private, encoded, link-local and IPv6 transition targets", () => {
  for (const address of ["127.0.0.1", "10.1.2.3", "169.254.169.254", "172.16.1.1", "192.168.0.1", "100.64.1.1", "::1", "::ffff:127.0.0.1", "fc00::1", "fe80::1", "2001:db8::1", "2002:7f00:1::"]) assert.equal(isPublicAddress(address), false, address);
  assert.equal(isPublicAddress("8.8.8.8"), true);
  assert.equal(isPublicAddress("2606:4700:4700::1111"), true);
  for (const url of ["http://127.0.0.1", "http://2130706433", "http://0x7f000001", "http://[::1]", "http://localhost", "http://site.local", "file:///etc/passwd", "https://user:password@example.com", "https://example.com:8443"]) assert.throws(() => auditUrl(url));
  assert.equal(auditUrl("https://example.com/path?token=private#secret").href, "https://example.com/path");
});
test("file scan never returns source text or matched secret values", () => {
  const marker = "not-a-real-key-test-marker";
  const report = analyzeSourceFiles([{ path: "src/test.ts", text: `const api_key = '${marker}'; eval('1');` }]);
  assert.ok(report.checks.some(check => check.code === "secret_indicators" && check.status === "warning"));
  assert.ok(!JSON.stringify(report).includes(marker));
  for (const path of ["../secret.ts", ".env", ".env.production", "node_modules/pkg/index.js", "build/app.js", "private.pem", "/absolute.ts"]) assert.equal(allowedSourcePath(path), false);
  assert.throws(() => analyzeSourceFiles([{ path: "../secret.ts", text: "" }]));
});
test("HTML scan reports measured checks without claiming full browser or security testing", () => {
  const checks = analyzeHtml('<html lang="en"><head><title>Example</title><meta name="description" content="Example site"><meta name="viewport" content="width=device-width"></head><body><h1>Hello</h1><img src="a.jpg"></body></html>');
  assert.equal(checks.find(check => check.code === "title").status, "pass");
  assert.equal(checks.find(check => check.code === "image_alt").count, 1);
  assert.equal(checks.find(check => check.code === "visual_browser").status, "not_tested");
});
