import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { load } from "./test-typescript-loader.mjs";
const {validShareToken,shareTokenHash,shareExpiresAt}=load("lib/audits/sharing.ts");
test("share links use full entropy tokens, hashed storage and a seven-day expiry",()=>{
  const token=randomBytes(32).toString("hex");assert.equal(validShareToken(token),true);
  for(const invalid of ["",token.slice(1),"g".repeat(64),"/../".repeat(16)])assert.equal(validShareToken(invalid),false);
  assert.notEqual(shareTokenHash(token),token);assert.equal(shareTokenHash(token),shareTokenHash(token));
  assert.notEqual(shareTokenHash(token),shareTokenHash(randomBytes(32).toString("hex")));
  const now=new Date("2026-10-06T00:00:00Z");assert.equal(shareExpiresAt(now).toISOString(),"2026-10-13T00:00:00.000Z");
});
