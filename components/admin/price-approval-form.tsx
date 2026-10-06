"use client";
import { useActionState } from "react";
import { approveProjectPrice, type PriceApprovalState } from "@/app/actions/billing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { billingCopy } from "@/lib/i18n/billing-copy";
import type { Locale } from "@/lib/i18n/config";

export function PriceApprovalForm({ projectId, amount, locked, locale, approved = false }: { projectId: string; amount: number; locked: boolean; locale: Locale; approved?: boolean }) {
  const [state, action, pending] = useActionState(approveProjectPrice, { code: "idle" } as PriceApprovalState);
  return <form action={action} className="mt-5 space-y-3">
    <Input type="hidden" name="projectId" value={projectId}/>
    <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div><Label htmlFor={`price-${projectId}`}>{billingCopy.total[locale]} · EUR</Label><Input id={`price-${projectId}`} className="mt-2" type="number" name="amount" min="1" max="1000000" step="0.01" required defaultValue={amount} disabled={locked || pending}/></div>
      <Button type="submit" variant="neon" disabled={locked || pending}>{billingCopy.approve[locale]}</Button>
    </div>
    <p role="status" className="text-sm leading-7">{locked || state.code === "locked" ? billingCopy.locked[locale] : state.code === "invalid" ? billingCopy.invalid[locale] : state.code === "saved" || approved ? billingCopy.saved[locale] : billingCopy.approval[locale]}</p>
  </form>;
}
