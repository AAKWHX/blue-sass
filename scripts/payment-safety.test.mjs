import test from "node:test";
import assert from "node:assert/strict";
import { load } from "./test-typescript-loader.mjs";
const { installmentSchedule, installmentReadiness } = load("lib/installments.ts");
const { verifiedCompletedCapture } = load("lib/paypal.ts");

test("approval and completed previous milestones gate every installment", () => {
  assert.deepEqual(installmentReadiness([], []), { next: null, ready: false });
  const rows = installmentSchedule(12345).map(item => ({ ...item, payment: null }));
  assert.equal(installmentReadiness(rows, []).ready, true);
  for (let index = 0; index < rows.length; index++) {
    const milestones = rows.slice(0, index).map(row => ({ stage: row.stage, status: "done" }));
    assert.equal(installmentReadiness(rows, milestones).next.stage, rows[index].stage);
    assert.equal(installmentReadiness(rows, milestones).ready, true);
    if (index > 0) {
      assert.equal(installmentReadiness(rows, []).ready, false);
      assert.equal(installmentReadiness(rows, milestones.map(row => ({ ...row, status: "in_progress" }))).ready, false);
    }
    rows[index].payment = { status: "pending" };
    assert.equal(installmentReadiness(rows, milestones).next.stage, rows[index].stage);
    rows[index].payment = { status: "failed" };
    assert.equal(installmentReadiness(rows, milestones).next.stage, rows[index].stage);
    rows[index].payment = { status: "paid" };
  }
  assert.deepEqual(installmentReadiness(rows, []), { next: null, ready: false });
});

test("only a matching COMPLETED capture is accepted", () => {
  const expected = { orderId: "TEST-ORDER", paymentId: "TEST-PAYMENT", amountCents: 1234, currency: "EUR" };
  const order = { id: expected.orderId, intent: "CAPTURE", status: "COMPLETED", purchase_units: [{ custom_id: expected.paymentId, payments: { captures: [{ id: "TEST-CAPTURE", status: "COMPLETED", amount: { currency_code: "EUR", value: "12.34" } }] } }] };
  assert.equal(verifiedCompletedCapture(order, expected).id, "TEST-CAPTURE");
  for (const mutate of [
    value => value.status = "APPROVED",
    value => value.id = "OTHER-ORDER",
    value => value.intent = "AUTHORIZE",
    value => value.purchase_units[0].custom_id = "OTHER-PAYMENT",
    value => value.purchase_units[0].payments.captures[0].status = "PENDING",
    value => value.purchase_units[0].payments.captures[0].amount.value = "1.00",
    value => value.purchase_units[0].payments.captures[0].amount.currency_code = "USD",
    value => delete value.purchase_units[0].payments.captures[0].amount,
    value => value.purchase_units[0].payments.captures.push(value.purchase_units[0].payments.captures[0]),
    value => value.purchase_units.push(value.purchase_units[0]),
  ]) {
    const changed = structuredClone(order); mutate(changed);
    assert.equal(verifiedCompletedCapture(changed, expected), null);
  }
});
