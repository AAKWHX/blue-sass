import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { load } from "./test-typescript-loader.mjs";
const { validPasswordLength, checkNewPassword } = load("lib/auth/password-policy.ts");
const { readBoundedText } = load("lib/request-body.ts");
test("new passwords cannot be truncated; safe legacy passwords still sign in",()=>{
  assert.equal(validPasswordLength("abcdefgh",true),true);
  assert.equal(validPasswordLength("abcdefgh"),false);
  assert.equal(validPasswordLength("a".repeat(73),true),false);
  assert.equal(validPasswordLength("ع".repeat(37)),false);
  assert.equal(validPasswordLength("ع".repeat(36)),true);
});
test("breach lookup sends only the prefix, ignores padding, and fails closed",async()=>{
  const password="synthetic-test-password";
  const hash=createHash("sha1").update(password).digest("hex").toUpperCase();
  const request=async(url,opts)=>{
    assert.equal(url,`https://api.pwnedpasswords.com/range/${hash.slice(0,5)}`);
    assert.equal(opts.headers["Add-Padding"],"true");
    assert.equal(opts.body,undefined);
    return new Response(`${hash.slice(5)}:17\r\n`);
  };
  assert.equal(await checkNewPassword(password,request),"breached");
  assert.equal(await checkNewPassword(password,async()=>new Response(`${hash.slice(5)}:0\r\n`)),"ok");
  assert.equal(await checkNewPassword(password,async()=>new Response("invalid")),"unavailable");
  assert.equal(await checkNewPassword(password,async()=>{throw Error("offline")}),"unavailable");
  assert.equal(await checkNewPassword(password,async()=>new Response("A".repeat(200001))),"unavailable");
});
test("JSON bodies enforce byte limits without trusting content-length",async()=>{
  const req=body=>new Request("https://example.test",{method:"POST",body});
  assert.equal(await readBoundedText(req("{}"),2),"{}");
  await assert.rejects(readBoundedText(req("عع"),3),/BODY_TOO_LARGE/);
  await assert.rejects(readBoundedText(new Request("https://example.test",{method:"POST",body:"{}",headers:{"content-length":"999"}}),20),/BODY_TOO_LARGE/);
});
