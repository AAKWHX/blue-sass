import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, FileSearch, Layers, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isLocale } from "@/lib/i18n/config";
import { platformCopy } from "@/lib/i18n/platform-tools";
import { subscriptionPlans, subscriptionPurchaseNote } from "@/lib/subscriptions";
export const metadata: Metadata = { title: "Blue Sass — Digital project tools", description: "Website and source review, private reports and comparison tools." };
export default async function SubscriptionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const c = platformCopy(locale); const plans = subscriptionPlans(locale);
  const icons = [FileSearch, Layers, ShieldCheck];
  return <div className="tool-surface py-12 sm:py-20"><div className="container-x">
    <div className="mx-auto max-w-3xl text-center"><h1 className="text-4xl font-bold leading-tight sm:text-6xl">{c.plansTitle}</h1><p className="mt-5 text-base leading-8 text-white/70">{c.plansIntro}</p><Button asChild variant="outline" className="mt-6 h-auto max-w-full whitespace-normal px-5 py-3 leading-7"><Link href={`/${locale}/audit`}>{c.free}</Link></Button></div>
    <div className="mt-12 grid gap-5 lg:grid-cols-3">{plans.map((plan, index) => { const Icon = icons[index]; return <Card key={plan.id} className={`tool-card ${index === 1 ? "border-white/60" : ""}`}><CardHeader><Icon className="mb-4 size-7"/><CardTitle className="text-2xl text-white">{plan.name}</CardTitle><p className="mt-3 text-sm text-white/65">{plan.description}</p><p className="mt-6"><strong className="text-5xl font-semibold">€{plan.price}</strong><span className="ms-2 text-sm text-white/60">/ {c.period}</span></p></CardHeader><CardContent className="flex flex-1 flex-col"><ul className="space-y-3">{plan.features.map(feature => <li key={feature} className="flex gap-2 text-sm leading-7"><Check className="mt-1 size-4 shrink-0 text-white/65"/><span>{feature}</span></li>)}</ul><Button asChild variant="neon" className="mt-8 w-full"><Link href={`/${locale}/quote?type=web&service=subscription-${plan.id}`}>{c.buy}</Link></Button></CardContent></Card>; })}</div>
    <Card className="tool-card mt-8"><CardContent className="space-y-4 pt-6"><p className="text-sm leading-8 text-white/75">{c.planNote}</p><p className="text-sm leading-8 text-white/65">{c.hostingNote}</p><p className="text-sm leading-8 text-white/65">{subscriptionPurchaseNote[locale]}</p><p className="text-sm leading-8 text-white/55">{c.limits}</p></CardContent></Card>
  </div></div>;
}
