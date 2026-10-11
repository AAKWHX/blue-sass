import test from "node:test";
import assert from "node:assert/strict";
import {load} from "./test-typescript-loader.mjs";
const {inquirySchema}=load("lib/validation/inquiry.ts");
const valid={name:"Test Customer",email:"test@example.com",projectType:"web",message:"A company website with clear service information.",locale:"ar"};
test("public inquiries bound input and cannot assign projects, prices or another identity",()=>{
 assert.equal(inquirySchema.safeParse(valid).success,true);
 for(const patch of [{email:"not-an-email"},{message:"short"},{name:"a"},{message:"a".repeat(3001)},{projectType:"unknown"},{budget:"0"},{website:"spam"},{convertedUserId:"owner"},{budgetEstimate:1},{locale:"invalid"}])assert.equal(inquirySchema.safeParse({...valid,...patch}).success,false);
});
