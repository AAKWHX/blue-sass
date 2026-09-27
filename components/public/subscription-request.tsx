"use client";
import { useActionState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/providers";
import { subscriptionPlans, type SubscriptionId } from "@/lib/subscriptions";
import { requestSubscription } from "@/app/actions/subscriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
export function SubscriptionRequest({ id }: { id: SubscriptionId }) {
 const { locale, t } = useI18n(); const c = t.experience; const plan = subscriptionPlans(locale).find(p => p.id === id)!;
 const [state, action, pending] = useActionState(requestSubscription, { ok: false, message: "" });
 return <section className="container-x py-16"><div className="mx-auto max-w-2xl rounded-3xl border border-black/20 bg-white p-7"><h1 className="text-3xl font-bold">{plan.name} · €{plan.price}</h1><p className="mt-4 leading-7">{plan.description}</p><p className="mt-3 text-sm leading-7 text-ink-low">{c.planRequestNote}</p><form action={action} className="mt-7 space-y-4"><input type="hidden" name="plan" value={id}/><input type="hidden" name="locale" value={locale}/><Label htmlFor="subscription-name">{c.name}</Label><Input id="subscription-name" name="name" minLength={2} maxLength={120} required/><Label htmlFor="subscription-message">{c.summary}</Label><Textarea id="subscription-message" name="message" maxLength={3000} rows={5}/><p className="text-sm leading-7 text-ink-low">{c.planLimits}</p><Button type="submit" variant="neon" disabled={pending || state.ok}>{t.quote.submit}</Button><p role="status">{state.message}</p>{state.ok && <Button asChild variant="outline"><Link href={`/${locale}/portal`}>{c.allProjects}</Link></Button>}</form></div></section>;
}
