export type ProjectAgreement = { version: number; included: string[]; excluded: string[]; revisionRounds: number; deliveryDays: number; priceCents: number | null; acceptedAt: string | null; acceptedBy: string | null };
export function mayEditAgreement(input: { stage: string; cancelled: boolean; locked: boolean; hasPayment: boolean }) {
  return input.stage === "planning" && !input.cancelled && !input.locked && !input.hasPayment;
}
export function mayAcceptAgreement(input: { clientId: string | null; viewerId: string; version: number; submittedVersion: number; priceCents: number | null; approvedPriceCents: number | null; cancelled: boolean }) {
  return !input.cancelled && input.clientId === input.viewerId && input.version === input.submittedVersion && input.priceCents !== null && input.priceCents === input.approvedPriceCents;
}
