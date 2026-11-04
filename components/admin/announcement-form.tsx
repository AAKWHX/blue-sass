"use client";

import { useI18n } from "@/components/providers";
import { useActionState } from "react";
import { Megaphone, Send } from "lucide-react";
import { sendAnnouncementAction, type AnnouncementState } from "@/app/actions/announcements";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const announcementCopy = {
 ar: { title: 'إرسال عرض أو تحديث', consent: 'سيصل فقط للمستخدمين الذين فعّلوا موافقة الرسائل من ملفهم الشخصي.', subject: 'عنوان الإيميل', message: 'التفاصيل', button: 'نص الزر', url: 'رابط الزر HTTPS', details: 'عرض التفاصيل', pending: 'جارٍ الإرسال…', send: 'إرسال للمشتركين', success: 'تمت معالجة طلب الإرسال.', unavailable: 'تعذّر إكمال الإرسال. راجع البيانات أو حاول لاحقًا.' },
 en: { title: 'Send an offer or update', consent: 'Only users who opted in to messages in their profile will receive it.', subject: 'Email subject', message: 'Message', button: 'Button text', url: 'HTTPS button link', details: 'View details', pending: 'Sending…', send: 'Send to subscribers', success: 'The send request was processed.', unavailable: 'Sending could not be completed. Review the details or try again later.' },
 nl: { title: 'Een aanbieding of update versturen', consent: 'Alleen gebruikers die in hun profiel toestemming voor berichten hebben gegeven, ontvangen dit bericht.', subject: 'E-mailonderwerp', message: 'Bericht', button: 'Knoptekst', url: 'HTTPS-link van de knop', details: 'Details bekijken', pending: 'Versturen…', send: 'Versturen naar abonnees', success: 'Het verzendverzoek is verwerkt.', unavailable: 'Versturen is niet gelukt. Controleer de gegevens of probeer het later opnieuw.' },
};
export function AnnouncementForm() {
  const { locale } = useI18n(); const c = announcementCopy[locale as keyof typeof announcementCopy] ?? announcementCopy.en;
  const [state, action, pending] = useActionState(sendAnnouncementAction, { ok: false, message: "" } satisfies AnnouncementState);
  return <form action={action} className="tool-card rounded-[2rem] border border-white/20 bg-[#101216] p-6 text-white shadow-sm sm:p-8"><Megaphone className="size-9"/><h2 className="mt-5 text-2xl font-black">{c.title}</h2><p className="mt-2 text-sm leading-7 text-white/75">{c.consent}</p><div className="mt-7 space-y-5"><div><Label htmlFor="announcement-title">{c.subject}</Label><Input id="announcement-title" name="title" required minLength={4} maxLength={120}/></div><div><Label htmlFor="announcement-message">{c.message}</Label><Textarea id="announcement-message" name="message" required minLength={20} maxLength={3000} rows={8}/></div><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="announcement-cta">{c.button}</Label><Input id="announcement-cta" name="ctaLabel" required defaultValue={c.details}/></div><div><Label htmlFor="announcement-url">{c.url}</Label><Input id="announcement-url" name="ctaUrl" type="url" required placeholder="https://www.bluesass.nl/ar/services" dir="ltr"/></div></div>{state.message ? <Alert variant={state.ok ? "success" : "destructive"}>{state.ok ? c.success : c.unavailable}</Alert> : null}<Button type="submit" variant="neon" disabled={pending}><Send className="size-4"/>{pending ? c.pending : c.send}</Button></div></form>;
}
