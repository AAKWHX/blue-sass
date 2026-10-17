import test from "node:test";
import assert from "node:assert/strict";
import { load } from "./test-typescript-loader.mjs";
const { invoiceSchema, invoiceTotals, invoiceUnitPrice } = load("lib/tools/invoice.ts");
const { stepNumber } = load("lib/numeric-input.ts");
const { roundedProduct } = load("lib/decimal-rounding.ts");
const { portfolioStatus, safePortfolioUrl } = load("lib/portfolio-presentation.ts");
const { readBoundedText } = load("lib/request-body.ts");
const { redesignCopy } = load("lib/i18n/redesign.ts");
const { locales } = load("lib/i18n/config.ts");
test("invoice decimal half-cent ties, quantities, VAT and discounts round in cents", () => {
  for (const [price, cents] of [[1.005,101],[10.075,1008],[0.005,1],[99.995,10000]]) assert.equal(roundedProduct(price,1,2), cents);
  assert.equal(roundedProduct(.1,.3,2),3);
  assert.equal(invoiceUnitPrice(1.005),"EUR 1.005");
  assert.equal(invoiceUnitPrice(1),"EUR 1.00");
  assert.equal(roundedProduct(1e-7,10000,2),0);
  const data=invoiceSchema.parse({company:"Test",customer:"Client",number:"1",due:"2026-10-15",discount:10,vat:21,items:[{name:"Work",quantity:1,price:10.075}]});
  assert.deepEqual(invoiceTotals(data),{subtotal:1008,discount:101,net:907,vat:190,total:1097});
  for(const items of [[],[{name:"x",quantity:0,price:1}],[{name:"x",quantity:1,price:Infinity}]]) assert.equal(invoiceSchema.safeParse({...data,items}).success,false);
});
test("quantity controls step decimals, clamp boundaries and reject invalid ranges",()=>{
  assert.equal(stepNumber(.2,1,.1,0,1),.3);
  assert.equal(stepNumber(1,1,1.0005,0,10),2.0005);
  assert.equal(stepNumber(.01,1,1,.01,10000),1.01);
  assert.equal(stepNumber(.99,1,.1,0,1),1);
  assert.equal(stepNumber(.01,-1,1,.01,10000),.01);
  assert.throws(()=>stepNumber(NaN,1),/INVALID/);
  assert.throws(()=>stepNumber(1,1,0),/INVALID/);
});
test("unfinished projects cannot receive completed or published badges",()=>{
  for(const stage of ["design","development","testing","review"]) assert.equal(portfolioStatus(stage,"https://example.com"),"inDevelopment");
  assert.equal(portfolioStatus("planning","https://example.com"),"comingSoon");
  assert.equal(portfolioStatus("completed",""),"completed");
  assert.equal(portfolioStatus("completed","https://example.com"),"published");
  for(const url of ["javascript:alert(1)","http://example.com","https://user:secret@example.com", "//example.com"]) assert.equal(safePortfolioUrl(url),false);
});
test("new UI copy exists for every supported locale",()=>{
  for(const locale of locales) for(const value of Object.values(redesignCopy(locale))) assert.ok(typeof value==="string"&&value.length>0,locale);
});
test("bounded bodies reject streamed overflow without content length and release the stream",async()=>{
  const request = new Request("https://example.com",{method:"POST",body:new ReadableStream({start(controller){controller.enqueue(new Uint8Array(6));controller.enqueue(new Uint8Array(6));controller.close();}}),duplex:"half"});
  await assert.rejects(readBoundedText(request,10),/BODY_TOO_LARGE/);
  assert.equal(await readBoundedText(new Response("مرحبا"),10),"مرحبا");
});

const { qrPayload } = load("lib/tools/qr.ts");
test("QR modes handle Arabic, invalid URLs, empty input, contact data and Wi-Fi escaping",async()=>{
 const QR=(await import("qrcode")).default;
 assert.equal(qrPayload("Text","مرحبا بالعالم"),"مرحبا بالعالم");
 assert.equal(qrPayload("URL","https://example.com"),"https://example.com/");
 for(const value of ["", "javascript:alert(1)","https://user:password@example.com"]) assert.throws(()=>qrPayload("URL",value));
 assert.throws(()=>qrPayload("Text","x".repeat(1501)));
 assert.throws(()=>qrPayload("Email","invalid"));
 assert.equal(qrPayload("Email","hello@example.com"),"mailto:hello@example.com");
 assert.equal(qrPayload("Phone","+31 (6) 1234-5678"),"tel:+31612345678");
 assert.equal(qrPayload("WhatsApp","+31 612345678"),"https://wa.me/31612345678");
 assert.throws(()=>qrPayload("Phone","+++12345"));
 assert.equal(qrPayload("Wi-Fi","Guest;network","a:b"),"WIFI:T:WPA;S:Guest\\;network;P:a\\:b;;");
 assert.throws(()=>qrPayload("vCard","Not a contact"));
 assert.match(qrPayload("vCard","BEGIN:VCARD\nFN:Test\nEND:VCARD"),/FN:Test/);
 const payload=qrPayload("Text","مرحبا");
 assert.match(await QR.toDataURL(payload),/^data:image\/png;base64,/);
 assert.match(await QR.toString(payload,{type:"svg"}),/<svg/);
});
