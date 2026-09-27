import test from "node:test";
import assert from "node:assert/strict";
import { canChangeRequest } from "../lib/project-policy.ts";
import { quoteReturnPath } from "../lib/auth/return-path.ts";
import { experience } from "../lib/i18n/experience.ts";
const planning = { clientId: "owner", stage: "planning" };
const open = { locked: false, cancelled: false };
test("only the owner can edit or cancel a planning request", () => {
 assert.equal(canChangeRequest(planning, "owner", open), true);
 assert.equal(canChangeRequest(planning, "other", open), false);
 assert.equal(canChangeRequest(null, "owner", open), false);
 assert.equal(canChangeRequest({ ...planning, clientId: null }, "owner", open), false);
});
test("every post-planning stage closes editing", () => {
 for (const stage of ["design", "development", "testing", "review", "completed"]) assert.equal(canChangeRequest({ ...planning, stage }, "owner", open), false);
});
test("returning to planning does not reopen design-started or cancelled requests", () => {
 assert.equal(canChangeRequest(planning, "owner", { ...open, locked: true }), false);
 assert.equal(canChangeRequest(planning, "owner", { ...open, cancelled: true }), false);
});
test("authentication preserves template and subscription choices", () => {
 for (const path of ["/ar/quote?service=web&template=web-2", "/ar/quote?service=subscription-growth", "/ar/portal/projects/10000000-0000-4000-8000-000000000001"]) assert.equal(quoteReturnPath(path, "ar"), path);
 assert.equal(quoteReturnPath("//evil.example/ar/quote", "ar"), "/ar/portal");
});
test("new interface copy is populated in all seven languages", () => {
 for (const locale of ["ar", "en", "nl", "de", "tr", "fr", "es"]) for (const [key,value] of Object.entries(experience(locale))) assert.ok(typeof value === "string" && value.length > 0, `${locale}.${key}`);
});
