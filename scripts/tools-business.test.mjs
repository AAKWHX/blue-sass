import test from "node:test";
import assert from "node:assert/strict";
import {load} from "./test-typescript-loader.mjs";
const {invoiceSchema,invoiceTotals}=load("lib/tools/invoice.ts");
const {listingActive,commerceOrderPrice}=load("lib/marketplace.ts");
test("paid job prices are authoritative and cannot be reduced by a caller",()=>{
 assert.equal(commerceOrderPrice("job",{tier:"featured",price:29}),2900);
 assert.throws(()=>commerceOrderPrice("job",{tier:"premium",price:1}),/INVALID_ORDER_PRICE/);
 assert.throws(()=>commerceOrderPrice("job",{tier:"basic",price:0}),/INVALID_ORDER_PRICE/);
});
const {adEligiblePath}=load("lib/advertising.ts");
test("invoice rounds line totals and applies discount before VAT",()=>{
 const input=invoiceSchema.parse({company:"Blue Sass",customer:"Test",number:"1",due:"2026-10-10",notes:"",discount:10,vat:21,items:[{name:"Item",quantity:3,price:0.1},{name:"Other",quantity:2,price:19.95}]});
 assert.deepEqual(invoiceTotals(input),{subtotal:4020,discount:402,net:3618,vat:760,total:4378});
 assert.equal(invoiceSchema.safeParse({...input,vat:-1}).success,false);
});
test("paid job exposure needs approval, payment, and an unexpired 30-day window",()=>{
 const start=new Date("2026-10-01T00:00:00Z");const now=new Date("2026-10-07T00:00:00Z");
 assert.equal(listingActive("approved","job","premium",start,null,now),false);
 assert.equal(listingActive("pending","job","premium",start,start,now),false);
 assert.equal(listingActive("approved","job","premium",start,start,now),true);
 assert.equal(listingActive("approved","job","premium",new Date("2026-10-07T00:00:00Z"),start,new Date("2026-11-05T00:00:00Z")),true);
 assert.equal(listingActive("approved","job","basic",start,null,new Date("2026-10-31T00:00:00Z")),false);
});
test("ad eligibility excludes authentication, payments and sensitive tool inputs in every locale",()=>{
 const {locales}=load("lib/i18n/config.ts");
 for(const locale of locales){for(const path of ["login","register","portal","admin","quote","tools/invoice-generator","tools/message-checker","tools/ai-content-generator","tools/qr-code-generator","tools/website-audit"])assert.equal(adEligiblePath(`/${locale}/${path}`),false);assert.equal(adEligiblePath(`/${locale}/tools`),true);}
});
