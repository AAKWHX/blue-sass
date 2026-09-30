"use client";

import { useActionState, useState } from "react";
import { Camera, Save } from "lucide-react";
import { updateProfileAction, type ProfileState } from "@/app/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { localeMeta, locales, type Locale } from "@/lib/i18n";

const copy = {
  ar: { photo: "الصورة الشخصية", hint: "PNG أو JPG أو WebP، بحد أقصى 750 KB", name: "الاسم الكامل", company: "الشركة", title: "المسمى الوظيفي", phone: "رقم الهاتف", email: "البريد الإلكتروني", language: "لغة الحساب", save: "حفظ التعديلات", settings: "إعدادات الحساب", note: "تُستخدم هذه البيانات في لوحة مشاريعك والتواصل مع الفريق." },
  en: { photo: "Profile photo", hint: "PNG, JPG or WebP, up to 750 KB", name: "Full name", company: "Company", title: "Job title", phone: "Phone", email: "Email", language: "Account language", save: "Save changes", settings: "Account settings", note: "These details are used in your project workspace and team communication." },
  nl: { photo: "Profielfoto", hint: "PNG, JPG of WebP, maximaal 750 KB", name: "Volledige naam", company: "Bedrijf", title: "Functie", phone: "Telefoon", email: "E-mail", language: "Accounttaal", save: "Wijzigingen opslaan", settings: "Accountinstellingen", note: "Deze gegevens worden gebruikt in uw projectomgeving." },
  de: { photo: "Profilbild", hint: "PNG, JPG oder WebP, maximal 750 KB", name: "Vollständiger Name", company: "Unternehmen", title: "Position", phone: "Telefon", email: "E-Mail", language: "Kontosprache", save: "Änderungen speichern", settings: "Kontoeinstellungen", note: "Diese Angaben werden im Projektbereich verwendet." },
  tr: { photo: "Profil fotoğrafı", hint: "PNG, JPG veya WebP, en fazla 750 KB", name: "Ad soyad", company: "Şirket", title: "Unvan", phone: "Telefon", email: "E-posta", language: "Hesap dili", save: "Değişiklikleri kaydet", settings: "Hesap ayarları", note: "Bu bilgiler proje alanınızda kullanılır." },
  fr: { photo: "Photo de profil", hint: "PNG, JPG ou WebP, 750 Ko maximum", name: "Nom complet", company: "Entreprise", title: "Fonction", phone: "Téléphone", email: "E-mail", language: "Langue du compte", save: "Enregistrer", settings: "Paramètres du compte", note: "Ces informations sont utilisées dans votre espace projet." },
  es: { photo: "Foto de perfil", hint: "PNG, JPG o WebP, máximo 750 KB", name: "Nombre completo", company: "Empresa", title: "Cargo", phone: "Teléfono", email: "Correo", language: "Idioma de la cuenta", save: "Guardar cambios", settings: "Ajustes de cuenta", note: "Estos datos se usan en su espacio de proyectos." },
} as const;

export function ProfileForm({ locale, user }: { locale: Locale; user: { name: string | null; email: string; image: string | null; company: string | null; title: string | null; phone: string | null; locale: string } }) {
  const c = copy[locale];
  const initial: ProfileState = { ok: false, message: "" };
  const [state, action, pending] = useActionState(updateProfileAction, initial);
  const [preview, setPreview] = useState(user.image || "");
  return <form action={action} className="grid gap-8 lg:grid-cols-[280px_1fr]">
    <section className="rounded-3xl border border-black/10 bg-white p-6 text-center shadow-sm">
      <Avatar className="mx-auto size-32 border-4 border-base shadow-xl"><AvatarImage src={preview} alt={user.name || c.photo}/><AvatarFallback className="bg-black text-3xl text-white">{user.name?.charAt(0).toUpperCase() || "B"}</AvatarFallback></Avatar>
      <Label htmlFor="profile-image" className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full border border-black bg-white px-4 py-2 font-bold text-black"><Camera className="size-4"/>{c.photo}</Label>
      <Input id="profile-image" name="image" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event)=>{const file=event.target.files?.[0]; if(file) setPreview(URL.createObjectURL(file));}}/>
      <p className="mt-3 text-xs leading-6 text-ink-low">{c.hint}</p>
    </section>
    <section id="settings" className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-black text-black">{c.settings}</h2><p className="mt-2 text-sm leading-7 text-ink-low">{c.note}</p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div><Label htmlFor="profile-name">{c.name}</Label><Input id="profile-name" name="name" defaultValue={user.name || ""} required minLength={2}/></div>
        <div><Label htmlFor="profile-email">{c.email}</Label><Input id="profile-email" value={user.email} readOnly disabled/></div>
        <div><Label htmlFor="profile-company">{c.company}</Label><Input id="profile-company" name="company" defaultValue={user.company || ""}/></div>
        <div><Label htmlFor="profile-title">{c.title}</Label><Input id="profile-title" name="title" defaultValue={user.title || ""}/></div>
        <div><Label htmlFor="profile-phone">{c.phone}</Label><Input id="profile-phone" name="phone" type="tel" defaultValue={user.phone || ""} dir="ltr"/></div>
        <div><Label>{c.language}</Label><Select name="locale" defaultValue={locales.includes(user.locale as Locale) ? user.locale : locale}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{locales.map(code=><SelectItem key={code} value={code}>{localeMeta[code].flag} {localeMeta[code].native}</SelectItem>)}</SelectContent></Select></div>
      </div>
      {state.message ? <Alert variant={state.ok ? "success" : "destructive"} className="mt-6">{state.message}</Alert> : null}
      <Button type="submit" variant="neon" className="mt-7" disabled={pending}><Save className="size-4"/>{pending ? "…" : c.save}</Button>
    </section>
  </form>;
}
