export const billingStages = ["planning", "design", "development", "testing", "review", "completed"] as const;
export type BillingStage = typeof billingStages[number];
export const installmentPercentages = [10, 20, 35, 15, 10, 10] as const;

/** Round in integer minor units; the last stage absorbs the rounding remainder. */
export function installmentSchedule(totalCents: number) {
  if (!Number.isSafeInteger(totalCents) || totalCents < 100 || totalCents > 100_000_000) throw new Error("INVALID_APPROVED_TOTAL");
  let allocated = 0;
  return billingStages.map((stage, index) => {
    const amountCents = index === billingStages.length - 1 ? totalCents - allocated : Math.floor(totalCents * installmentPercentages[index] / 100);
    allocated += amountCents;
    return { stage, percent: installmentPercentages[index], amountCents };
  });
}

export function installmentReadiness<T extends { stage: BillingStage; payment: { status: string } | null }>(installments: T[], milestones: Array<{ stage: string; status: string }>) {
  const next = installments.find(item => item.payment?.status !== "paid") ?? null;
  const index = next ? billingStages.indexOf(next.stage) : -1;
  const ready = installments.length === billingStages.length && !!next && billingStages.slice(0, index).every(stage => {
    const rows = milestones.filter(item => item.stage === stage);
    return rows.length > 0 && rows.every(item => item.status === "done");
  });
  return { next, ready };
}
