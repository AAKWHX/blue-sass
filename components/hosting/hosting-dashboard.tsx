"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CheckCircle2, CloudUpload, ExternalLink, FolderOpen, LoaderCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { HostedSite } from "@/lib/db/schema";
import type { Locale } from "@/lib/i18n";

const copy = {
  ar: { name: "اسم الموقع", type: "نوع المشروع", static: "موقع Static", next: "تطبيق Next.js", folder: "اختر فولدر المشروع", chosen: "ملف محدد", confirm: "أؤكد أن الملفات تخصني ولا تحتوي على كلمات مرور أو مفاتيح سرية.", deploy: "استضافة الموقع", deploying: "جارٍ رفع الملفات وبدء النشر…", preparing: "جارٍ فحص الملفات وتجهيزها…", waiting: "اكتمل الرفع، جارٍ إنشاء الموقع. قد يستغرق ذلك دقيقة…", network: "تعذر الاتصال بخدمة الاستضافة. تحقق من الإنترنت ثم أعد المحاولة.", invalid: "وصل رد غير صالح من الخادم. أعد المحاولة، وإن استمرت المشكلة تواصل معنا.", tooLarge: "تجاوزت الملفات الحد المسموح: 200 ملف وبحجم إجمالي 4 MB.", limits: "حتى 200 ملف و4 MB. لا ترفع .env أو node_modules أو مجلدات البناء.", sites: "مواقعك المستضافة", empty: "لا توجد مواقع مستضافة بعد.", details: "الإعدادات والتفاصيل", visit: "زيارة الموقع", ready: "جاهز", building: "قيد البناء", uploading: "قيد الرفع", failed: "فشل" },
  en: { name: "Site name", type: "Project type", static: "Static website", next: "Next.js application", folder: "Choose project folder", chosen: "files selected", confirm: "I confirm I own these files and they contain no passwords or secret keys.", deploy: "Host website", deploying: "Uploading files and starting deployment…", limits: "Up to 200 files and 4 MB. Do not upload .env, node_modules or build folders.", sites: "Your hosted sites", empty: "No hosted sites yet.", details: "Settings and details", visit: "Visit site", ready: "Ready", building: "Building", uploading: "Uploading", failed: "Failed" },
  nl: { name: "Sitenaam", type: "Projecttype", static: "Statische website", next: "Next.js-app", folder: "Projectmap kiezen", chosen: "bestanden gekozen", confirm: "Ik bevestig dat deze bestanden van mij zijn en geen geheime sleutels bevatten.", deploy: "Website hosten", deploying: "Bestanden uploaden…", limits: "Maximaal 200 bestanden en 4 MB. Upload geen .env, node_modules of buildmappen.", sites: "Uw gehoste sites", empty: "Nog geen sites.", details: "Instellingen en details", visit: "Site bezoeken", ready: "Gereed", building: "Wordt gebouwd", uploading: "Uploaden", failed: "Mislukt" },
  de: { name: "Websitename", type: "Projekttyp", static: "Statische Website", next: "Next.js-Anwendung", folder: "Projektordner wählen", chosen: "Dateien gewählt", confirm: "Ich bestätige, dass mir diese Dateien gehören und keine geheimen Schlüssel enthalten.", deploy: "Website hosten", deploying: "Dateien werden hochgeladen…", limits: "Bis 200 Dateien und 4 MB. Keine .env-, node_modules- oder Build-Ordner.", sites: "Ihre Websites", empty: "Noch keine Websites.", details: "Einstellungen und Details", visit: "Website öffnen", ready: "Bereit", building: "Im Aufbau", uploading: "Upload", failed: "Fehler" },
  tr: { name: "Site adı", type: "Proje türü", static: "Statik web sitesi", next: "Next.js uygulaması", folder: "Proje klasörünü seç", chosen: "dosya seçildi", confirm: "Dosyaların bana ait olduğunu ve gizli anahtar içermediğini onaylıyorum.", deploy: "Siteyi barındır", deploying: "Dosyalar yükleniyor…", limits: "En fazla 200 dosya ve 4 MB. .env, node_modules veya build klasörlerini yüklemeyin.", sites: "Barındırılan siteleriniz", empty: "Henüz site yok.", details: "Ayarlar ve ayrıntılar", visit: "Siteyi ziyaret et", ready: "Hazır", building: "Oluşturuluyor", uploading: "Yükleniyor", failed: "Başarısız" },
  fr: { name: "Nom du site", type: "Type de projet", static: "Site statique", next: "Application Next.js", folder: "Choisir le dossier", chosen: "fichiers sélectionnés", confirm: "Je confirme posséder ces fichiers et qu’ils ne contiennent aucun secret.", deploy: "Héberger le site", deploying: "Téléversement en cours…", limits: "200 fichiers et 4 Mo maximum. Aucun .env, node_modules ou dossier de build.", sites: "Vos sites hébergés", empty: "Aucun site pour le moment.", details: "Paramètres et détails", visit: "Visiter le site", ready: "Prêt", building: "Construction", uploading: "Téléversement", failed: "Échec" },
  es: { name: "Nombre del sitio", type: "Tipo de proyecto", static: "Sitio estático", next: "Aplicación Next.js", folder: "Elegir carpeta", chosen: "archivos seleccionados", confirm: "Confirmo que estos archivos son míos y no contienen secretos.", deploy: "Alojar sitio", deploying: "Subiendo archivos…", limits: "Hasta 200 archivos y 4 MB. No suba .env, node_modules ni carpetas de compilación.", sites: "Tus sitios alojados", empty: "Todavía no hay sitios.", details: "Ajustes y detalles", visit: "Visitar sitio", ready: "Listo", building: "Construyendo", uploading: "Subiendo", failed: "Falló" },
} as const;

function uploadDeployment(formData: FormData, onProgress: (value: number) => void) {
  return new Promise<{ status: number; body: { id?: string; error?: string } }>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/hosting/deploy");
    request.timeout = 120_000;
    request.upload.onprogress = (event) => event.lengthComputable && onProgress(Math.round((event.loaded / event.total) * 100));
    request.onerror = () => reject(new Error("network"));
    request.ontimeout = () => reject(new Error("network"));
    request.onload = () => {
      try { resolve({ status: request.status, body: JSON.parse(request.responseText) }); }
      catch { reject(new Error("invalid")); }
    };
    request.send(formData);
  });
}

export function HostingDashboard({ locale, initialSites }: { locale: Locale; initialSites: HostedSite[] }) {
  const c = copy[locale]; const router = useRouter(); const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]); const [framework, setFramework] = useState("static"); const [confirmed, setConfirmed] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [phase, setPhase] = useState<"idle"|"preparing"|"uploading"|"waiting">("idle"); const [progress, setProgress] = useState(0);
  async function submit(formData: FormData) {
    if (!files.length || !confirmed) return;
    const bytes = files.reduce((sum, file) => sum + file.size, 0);
    if (files.length > 200 || bytes > 4 * 1024 * 1024) { setMessage("tooLarge" in c ? c.tooLarge : c.limits); return; }
    setBusy(true); setMessage(""); setPhase("preparing"); setProgress(0);
    formData.set("framework", framework); formData.set("paths", JSON.stringify(files.map(file => file.webkitRelativePath || file.name)));
    files.forEach(file => formData.append("files", file, file.name));
    try {
      setPhase("uploading");
      const response = await uploadDeployment(formData, setProgress);
      if (response.status < 200 || response.status >= 300 || !response.body.id) { setMessage(response.body.error || ("invalid" in c ? c.invalid : "Deployment failed.")); return; }
      setProgress(100); setPhase("waiting");
      router.push(`/${locale}/hosting/${response.body.id}`); router.refresh();
    } catch (error) {
      setMessage(error instanceof Error && error.message === "invalid" && "invalid" in c ? c.invalid : "network" in c ? c.network : "Deployment failed.");
    } finally { setBusy(false); }
  }
  const folderProps = { webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement> & { webkitdirectory: string; directory: string };
  const statusLabel = (status: HostedSite["status"]) => c[status];
  return <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
    <form action={submit} className="rounded-[2rem] border border-black bg-black p-6 text-white shadow-2xl sm:p-8">
      <CloudUpload className="size-10 text-white"/><div className="mt-6"><Label htmlFor="hosting-name" className="text-white">{c.name}</Label><Input id="hosting-name" name="name" required minLength={2} maxLength={80} className="border-white/20 bg-white/10 text-white"/></div>
      <div className="mt-5"><Label className="text-white">{c.type}</Label><Select value={framework} onValueChange={setFramework}><SelectTrigger className="border-white/20 bg-white/10 text-white"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="static">{c.static}</SelectItem><SelectItem value="nextjs">{c.next}</SelectItem></SelectContent></Select></div>
      <div className="mt-5"><Input ref={inputRef} type="file" multiple className="sr-only" onChange={event=>setFiles(Array.from(event.target.files || []))} {...folderProps}/><Button type="button" variant="outline" className="w-full border-white/25 bg-white/10 text-white" onClick={()=>inputRef.current?.click()}><FolderOpen className="size-4"/>{c.folder}</Button>{files.length ? <p className="mt-2 text-sm text-white/65">{files.length} {c.chosen}</p> : null}</div>
      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-white/70"><Checkbox checked={confirmed} onCheckedChange={value=>setConfirmed(value === true)} className="mt-1"/><span>{c.confirm}</span></label><p className="mt-4 text-xs leading-6 text-white/45">{c.limits}</p>
      {busy ? <div className="mt-5 rounded-2xl border border-white/15 bg-white/[.06] p-4" role="status" aria-live="polite"><div className="flex items-center gap-3 text-sm font-semibold"><LoaderCircle className="size-4 animate-spin"/><span>{phase === "preparing" && "preparing" in c ? c.preparing : phase === "waiting" && "waiting" in c ? c.waiting : c.deploying}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-white transition-[width] duration-300" style={{width:`${phase === "waiting" ? 100 : Math.max(progress, 5)}%`}}/></div><p className="mt-2 text-xs text-white/50">{phase === "uploading" ? `${progress}%` : phase === "waiting" ? "100%" : "…"}</p></div> : null}
      {message ? <Alert variant="destructive" className="mt-5">{message}</Alert> : null}<Button type="submit" variant="neon" className="mt-6 w-full" disabled={busy || !files.length || !confirmed}>{busy ? <LoaderCircle className="size-4 animate-spin"/> : <CloudUpload className="size-4"/>}{busy ? c.deploying : c.deploy}</Button>
    </form>
    <section><h2 className="text-3xl font-black text-black">{c.sites}</h2><div className="mt-6 space-y-3">{initialSites.length ? initialSites.map(site=><article key={site.id} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="flex items-center gap-2"><CheckCircle2 className="size-4"/><h3 className="font-black text-black">{site.name}</h3></div><p className="mt-1 text-xs uppercase tracking-wider text-ink-low">{site.framework} · {statusLabel(site.status)}</p></div><div className="flex gap-2"><Button asChild variant="outline" size="sm"><Link href={`/${locale}/hosting/${site.id}`}>{c.details}</Link></Button>{site.url ? <Button asChild variant="neon" size="sm"><a href={`https://${site.url}`} target="_blank" rel="noreferrer">{c.visit}<ExternalLink className="size-3"/></a></Button> : null}</div></div></article>) : <p className="rounded-2xl border border-dashed border-black/20 p-8 text-center text-ink-low">{c.empty}</p>}</div></section>
  </div>;
}
