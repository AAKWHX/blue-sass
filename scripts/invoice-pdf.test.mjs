import test from "node:test";
import assert from "node:assert/strict";
import {load} from "./test-typescript-loader.mjs";
test("invoice renderer produces an Arabic PDF from validated monetary inputs",async()=>{
 const {invoicePdf}=load("lib/tools/invoice-pdf.tsx");
 const pdf=await invoicePdf({company:"شركة تجريبية",customer:"عميل تجريبي",number:"TEST-1",due:"2026-10-14",notes:"مثال للاختبار",vat:21,discount:5,items:[{name:"خدمة رقمية",quantity:2,price:19.5}]},"ar");
 assert.equal(pdf.subarray(0,5).toString(),"%PDF-");assert.ok(pdf.length>5000);
});
