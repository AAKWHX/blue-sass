import test from "node:test";
import assert from "node:assert/strict";
import { load } from "./test-typescript-loader.mjs";




const { readBoundedText } = load("lib/request-body.ts");
const { redesignCopy } = load("lib/i18n/redesign.ts");
const { locales } = load("lib/i18n/config.ts");



test("new UI copy exists for every supported locale",()=>{
  for(const locale of locales) for(const value of Object.values(redesignCopy(locale))) assert.ok(typeof value==="string"&&value.length>0,locale);
});
test("bounded bodies reject streamed overflow without content length and release the stream",async()=>{
  const request = new Request("https://example.com",{method:"POST",body:new ReadableStream({start(controller){controller.enqueue(new Uint8Array(6));controller.enqueue(new Uint8Array(6));controller.close();}}),duplex:"half"});
  await assert.rejects(readBoundedText(request,10),/BODY_TOO_LARGE/);
  assert.equal(await readBoundedText(new Response("مرحبا"),10),"مرحبا");
});



