import test from "node:test";
import assert from "node:assert/strict";
import { load } from "./test-typescript-loader.mjs";
const { analyzeMessageText } = load("lib/tools/message-analysis.ts");
const { messageToolCopy } = load("lib/i18n/message-tool.ts");
const { locales } = load("lib/i18n/config.ts");
test("message tool labels cover all fifteen locales and seven findings", () => {
  for (const locale of locales) {
    const c = messageToolCopy(locale);
    assert.equal(Object.keys(c.findings).length, 7);
    for (const value of [...Object.values(c).filter(value => typeof value === "string"), ...Object.values(c.findings)]) assert.ok(value?.trim());
  }
});
test("message analysis detects deceptive destinations without visiting links", () => {
  const result = analyzeMessageText('<a href="https://other.example/reset?token=secret">https://bank.example</a> Send your password immediately');
  assert.ok(result.findings.some(item => item.code === "hidden_destination" && item.severity === "high"));
  assert.ok(result.findings.some(item => item.code === "secret_request"));
  assert.ok(!JSON.stringify(result).includes("token=secret"));
  assert.deepEqual(result.linkOrigins, ["https://other.example", "https://bank.example"]);
  assert.ok(result.notChecked.includes("sender_identity"));
});
test("no indicators is not an assertion that a message is safe", () => {
  const result = analyzeMessageText("Meeting tomorrow at 10:00.");
  assert.equal(result.status, "no_indicators_found");
  assert.ok(result.notChecked.length > 0);
});
test("Arabic lures and credential-bearing links are identified", () => {
  const result = analyzeMessageText("أرسل كلمة المرور فوراً https://user:password@example.com/private");
  assert.ok(result.findings.some(item => item.code === "secret_request"));
  assert.ok(result.findings.some(item => item.code === "embedded_credentials"));
  assert.deepEqual(result.linkOrigins, ["https://example.com"]);
});
test("analysis bounds UTF-8 input", () => {
  assert.throws(() => analyzeMessageText("ع".repeat(16001)), /INPUT_TOO_LARGE/);
});
