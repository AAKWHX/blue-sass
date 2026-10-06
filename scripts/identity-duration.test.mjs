import test from "node:test";
import assert from "node:assert/strict";
import { load } from "./test-typescript-loader.mjs";
const { verifiedGoogleEmail, mayRepairGoogleLink } = load("lib/auth/google-identity.ts");
const { westernDigits, durationValue } = load("lib/validation/delivery-duration.ts");
test("Google identity must be verified and match the canonical account before link repair", () => {
  assert.equal(verifiedGoogleEmail({ email: "ETSKAR.K@gmail.com", email_verified: true }), "etskar.k@gmail.com");
  assert.equal(verifiedGoogleEmail({ email: "aak.geneltek@gmail.com", email_verified: false }), null);
  assert.equal(verifiedGoogleEmail({ email: "invalid", email_verified: true }), null);
  const target = { email: "etskar.k@gmail.com", emailVerified: new Date(), passwordHash: "hash", disabledAt: null };
  assert.equal(mayRepairGoogleLink(target, "etskar.k@gmail.com"), true);
  assert.equal(mayRepairGoogleLink(target, "aak.geneltek@gmail.com"), false);
  assert.equal(mayRepairGoogleLink({ ...target, emailVerified: null }, target.email), false);
  assert.equal(mayRepairGoogleLink({ ...target, disabledAt: new Date() }, target.email), false);
});
test("delivery duration accepts western, Arabic and Persian digits without coercing empty drafts", () => {
  assert.equal(westernDigits("٣٠"), "30");
  assert.equal(westernDigits("۱۲۳"), "123");
  assert.equal(durationValue("٣٠", 14), 30);
  for (const value of ["", "0", "13", "731", "2e2", "30.5", "-30", "text"]) assert.equal(durationValue(value,14), null);
  assert.equal(durationValue("730",14),730);
});
