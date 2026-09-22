import test from "node:test";
import assert from "node:assert/strict";
import { newResetCode, resetDigest, matchesResetCode, RESET_TTL, RESET_MAX_ATTEMPTS } from "../lib/auth/reset-code.ts";

test("reset codes are eight digits, including leading zeroes", () => {
  for (let i = 0; i < 100; i++) assert.match(newResetCode(), /^\d{8}$/);
});
test("digest is bound to the account and server secret", () => {
  const digest = resetDigest("owner@example.com", "00123456", "test-secret");
  assert.equal(matchesResetCode("owner@example.com", "00123456", digest, "test-secret"), true);
  assert.equal(matchesResetCode("other@example.com", "00123456", digest, "test-secret"), false);
  assert.equal(matchesResetCode("owner@example.com", "00123456", digest, "other-secret"), false);
  assert.equal(matchesResetCode("owner@example.com", "00123457", digest, "test-secret"), false);
});
test("malformed codes and digests fail closed", () => {
  assert.equal(matchesResetCode("a", "123", "bad", "s"), false);
  assert.equal(matchesResetCode("a", "12345678", "bad", "s"), false);
  assert.equal(RESET_TTL, 900000);
  assert.equal(RESET_MAX_ATTEMPTS, 5);
});
