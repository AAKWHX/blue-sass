import test from "node:test";
import assert from "node:assert/strict";
import { quoteReturnPath } from "../lib/auth/return-path.ts";
test("preserve selected platform after authentication", () => {
  assert.equal(quoteReturnPath("/ar/quote?type=mobile&service=ios", "ar"), "/ar/quote?type=mobile&service=ios");
});
test("reject external and unexpected destinations", () => {
  for (const path of ["https://example.com", "//example.com", "/ar/quote/../../admin", "/ar/quote\\evil", "/en/quote", null]) {
    assert.equal(quoteReturnPath(path, "ar"), "/ar/portal");
  }
});
