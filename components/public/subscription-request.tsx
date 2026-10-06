"use client";
import { localizeForLocale } from "@/lib/i18n/extra-locales";

import { useActionState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/providers";
import { subscriptionPlans, subscriptionPurchaseNote, type SubscriptionId } from "@/lib/subscriptions";
import { requestSubscription } from "@/app/actions/subscriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { platformCopy } from "@/lib/i18n/platform-tools";

export function SubscriptionRequest({ id }: { id: SubscriptionId }) {
  const { locale, t } = useI18n();
  const c = t.experience;
  const tools = platformCopy(locale);
  const plan = subscriptionPlans(locale).find((entry) => entry.id === id)!;
  const [state, action, pending] = useActionState(requestSubscription, { ok: false, message: "" });
  const checkout = locale === "ar" ? "حفظ والمتابعة إلى الدفع الآمن" : localizeForLocale("Save and continue to secure payment", locale);
  return <section className="container-x py-16"><div className="mx-auto max-w-2xl rounded-3xl border border-black/20 bg-white p-7">
    <h1 className="text-3xl font-bold">{plan.name} · €{plan.price}</h1>
    <p className="mt-4 leading-7">{plan.description}</p>
    <p className="mt-3 text-sm leading-7 text-ink-low">{subscriptionPurchaseNote[locale]}</p>
    <form action={action} className="mt-7 space-y-4">
      <input type="hidden" name="plan" value={id}/><input type="hidden" name="locale" value={locale}/>
      <Label htmlFor="subscription-name">{tools.currentPlan}</Label><Input id="subscription-name" name="name" minLength={2} maxLength={120} required defaultValue={plan.name}/>
      <Label htmlFor="subscription-message">{c.summary}</Label><Textarea id="subscription-message" name="message" maxLength={3000} rows={5}/>
      <ul className="space-y-2 text-sm leading-7">{plan.features.map(feature => <li key={feature}>{feature}</li>)}</ul><p className="text-sm leading-7 text-ink-low">{tools.planNote}</p>
      <Button type="submit" variant="neon" disabled={pending || state.ok}>{checkout}</Button>
      <p role="status">{state.message}</p>
      {state.ok && state.projectId && <Button asChild variant="neon" className="w-full"><Link href={`/${locale}/portal/projects/${state.projectId}/payment`}>PayPal · Visa · Mastercard</Link></Button>}
      {state.ok && <Button asChild variant="outline" className="w-full"><Link href={state.projectId ? `/${locale}/portal/projects/${state.projectId}` : `/${locale}/portal`}>{c.allProjects}</Link></Button>}
    </form>
  </div></section>;
}
