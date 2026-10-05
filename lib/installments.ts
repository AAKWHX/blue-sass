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
