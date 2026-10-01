"use client";

import { useActionState } from "react";
import { Megaphone, Send } from "lucide-react";
import { sendAnnouncementAction, type AnnouncementState } from "@/app/actions/announcements";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AnnouncementForm() {
  const [state, action, pending] = useActionState(sendAnnouncementAction, { ok: false, message: "" } satisfies AnnouncementState);
  return <form action={action} className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm sm:p-8"><Megaphone className="size-9"/><h2 className="mt-5 text-2xl font-black">إرسال عرض أو تحديث</h2><p className="mt-2 text-sm leading-7 text-ink-low">سيصل فقط للمستخدمين الذين فعّلوا موافقة الرسائل من ملفهم الشخصي.</p><div className="mt-7 space-y-5"><div><Label htmlFor="announcement-title">عنوان الإيميل</Label><Input id="announcement-title" name="title" required minLength={4} maxLength={120}/></div><div><Label htmlFor="announcement-message">التفاصيل</Label><Textarea id="announcement-message" name="message" required minLength={20} maxLength={3000} rows={8}/></div><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="announcement-cta">نص الزر</Label><Input id="announcement-cta" name="ctaLabel" required defaultValue="عرض التفاصيل"/></div><div><Label htmlFor="announcement-url">رابط الزر HTTPS</Label><Input id="announcement-url" name="ctaUrl" type="url" required placeholder="https://www.bluesass.nl/ar/services" dir="ltr"/></div></div>{state.message ? <Alert variant={state.ok ? "success" : "destructive"}>{state.message}</Alert> : null}<Button type="submit" variant="neon" disabled={pending}><Send className="size-4"/>{pending ? "جارٍ الإرسال…" : "إرسال للمشتركين"}</Button></div></form>;
}
