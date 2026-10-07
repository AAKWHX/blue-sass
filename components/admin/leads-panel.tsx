"use client";
import { withExtraLocales } from "@/lib/i18n/extra-locales";

/**
 * Sales inbox: every quote request submitted from the public estimator.
 *
 * Rendered above the ERP console on /admin. Status changes are posted through
 * a server action, so the role check happens on the server.
 */
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { toolsUi } from "@/lib/i18n/tools-ui";
import { isLocale } from "@/lib/i18n/config";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { updateLeadStatusAction } from "@/app/actions/leads";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { Lead } from "@/lib/db/schema";

const panelCopy = withExtraLocales({
  ar: { title: "طلبات التسعير", empty: "لا توجد طلبات تسعير بعد. ستظهر هنا الطلبات المرسلة من حاسبة المشروع.", contact: "جهة الاتصال", scope: "النطاق", estimate: "التقدير", status: "الحالة", weeks: "أسبوع", next: "نقل إلى" },
  en: { title: "Quote requests", empty: "No quote requests yet. Requests from the project estimator will appear here.", contact: "Contact", scope: "Scope", estimate: "Estimate", status: "Status", weeks: "weeks", next: "Move to" },
  nl: { title: "Offerteaanvragen", empty: "Nog geen aanvragen. Aanvragen uit de projectcalculator verschijnen hier.", contact: "Contact", scope: "Omvang", estimate: "Schatting", status: "Status", weeks: "weken", next: "Verplaats naar" },
  de: { title: "Angebotsanfragen", empty: "Noch keine Anfragen. Anfragen aus dem Projektkalkulator erscheinen hier.", contact: "Kontakt", scope: "Umfang", estimate: "Schätzung", status: "Status", weeks: "Wochen", next: "Verschieben zu" },
  tr: { title: "Teklif talepleri", empty: "Henüz teklif talebi yok. Proje hesaplayıcısından gelen talepler burada görünür.", contact: "İletişim", scope: "Kapsam", estimate: "Tahmin", status: "Durum", weeks: "hafta", next: "Taşı" },
  fr: { title: "Demandes de devis", empty: "Aucune demande pour le moment. Les demandes du calculateur apparaîtront ici.", contact: "Contact", scope: "Périmètre", estimate: "Estimation", status: "Statut", weeks: "semaines", next: "Passer à" },
  es: { title: "Solicitudes de presupuesto", empty: "Todavía no hay solicitudes. Las del estimador aparecerán aquí.", contact: "Contacto", scope: "Alcance", estimate: "Estimación", status: "Estado", weeks: "semanas", next: "Mover a" },
} as const);

export function LeadsPanel({ leads, locale, readOnly = false }: { leads: Lead[]; locale: string; readOnly?: boolean }) {
  const c = panelCopy[locale as keyof typeof panelCopy] ?? panelCopy.en;
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  const [selected,setSelected]=useState<string|null>(null);
  const [query,setQuery]=useState("");

  const labels = toolsUi(isLocale(locale) ? locale : "en");
  const active = leads.find(row=>row.id===selected);
  return <section className="container-x py-10"><h1 className="text-3xl font-semibold text-white">{c.title}</h1>
    <Input aria-label={labels.search} placeholder={labels.search} value={query} onChange={event=>setQuery(event.target.value)} className="my-6 max-w-xl"/>
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{leads.filter(lead=>`${lead.name} ${lead.email} ${lead.company??""}`.toLowerCase().includes(query.toLowerCase())).map(lead=><article key={lead.id} className="tool-card rounded-2xl border p-6"><div className="flex flex-wrap justify-between gap-3"><h2 className="text-xl font-semibold">{lead.name}</h2><Badge variant="outline">{lead.status}</Badge></div>
      <p className="mt-3 break-all text-sm text-white/75" dir="ltr">{lead.email}</p><p className="my-4 text-sm">{lead.company} · {lead.projectType}</p><p className="text-2xl font-semibold">{money.format(lead.budgetEstimate)}</p>
      <Button type="button" variant="outline" className="mt-5 w-full" onClick={()=>setSelected(lead.id)}>{labels.details}</Button></article>)}</div>{!leads.length&&<p className="py-10">{c.empty}</p>}
    <Dialog open={Boolean(active)} onOpenChange={open=>!open&&setSelected(null)}><DialogContent className="tool-surface"><DialogHeader><DialogTitle>{active?.name}</DialogTitle><DialogDescription>{c.title}</DialogDescription></DialogHeader>{active&&<div className="space-y-5"><dl className="grid gap-5 sm:grid-cols-2">{[{label:c.contact,value:active.email},{label:labels.categories.business,value:active.company??"—"},{label:c.scope,value:active.projectType},{label:c.estimate,value:money.format(active.budgetEstimate)},{label:c.weeks,value:active.timelineWeeks},{label:c.status,value:active.status}].map(row=><div key={row.label}><dt className="text-xs text-white/60">{row.label}</dt><dd className="mt-2 break-words text-base">{row.value}</dd></div>)}</dl>{active.phone&&<p dir="ltr">{active.phone}</p>}<ul className="space-y-2">{active.services.map(service=><li key={service} className="rounded-lg border border-white/15 p-3">{service}</li>)}</ul><p className="whitespace-pre-wrap break-words leading-8">{active.message}</p>{!readOnly&&<form action={updateLeadStatusAction} className="grid gap-3 sm:grid-cols-2"><Input type="hidden" name="id" value={active.id}/>{["new","contacted","qualified","won","lost"].map(status=><SubmitButton key={status} name="status" value={status} variant="outline" disabled={status===active.status}>{c.next} {status}</SubmitButton>)}</form>}</div>}</DialogContent></Dialog>
  </section>;
}
