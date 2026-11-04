import test from "node:test";
import assert from "node:assert/strict";
import {load} from "./test-typescript-loader.mjs";



const {adEligiblePath}=load("lib/advertising.ts");



test("ad eligibility excludes authentication, payments and sensitive tool inputs in every locale",()=>{
 const {locales}=load("lib/i18n/config.ts");
  for(const locale of locales){for(const path of ["login","register","portal","admin","quote","contact","create-project","audit","tools/invoice-generator","tools/message-checker","tools/ai-content-generator","tools/qr-code-generator","tools/website-audit"])assert.equal(adEligiblePath(`/${locale}/${path}`),false);for(const path of ["","services","services/web","about","projects","pricing","templates","tools"])assert.equal(adEligiblePath(`/${locale}${path?`/${path}`:""}`),true);}
});
