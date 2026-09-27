"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpLeft, ChevronDown, LogIn, Menu, UserRound } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { useI18n } from "@/components/providers";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/ui/switchers";

export interface SiteHeaderProps { signedIn?: boolean; userName?: string }

const navCopy = {
  ar: { home: "الرئيسية", about: "من نحن", services: "الخدمات", subscriptions: "الاشتراكات", projects: "أعمالنا", contact: "اتصل بنا", start: "ابدأ مشروعك", account: "حسابي" },
  en: { home: "Home", about: "About", services: "Services", subscriptions: "Plans", projects: "Work", contact: "Contact", start: "Start a project", account: "My account" },
  nl: { home: "Home", about: "Over ons", services: "Diensten", subscriptions: "Abonnementen", projects: "Werk", contact: "Contact", start: "Start een project", account: "Mijn account" },
  de: { home: "Start", about: "Über uns", services: "Leistungen", subscriptions: "Abos", projects: "Projekte", contact: "Kontakt", start: "Projekt starten", account: "Mein Konto" },
  tr: { home: "Ana sayfa", about: "Hakkımızda", services: "Hizmetler", subscriptions: "Paketler", projects: "Projeler", contact: "İletişim", start: "Proje başlat", account: "Hesabım" },
  fr: { home: "Accueil", about: "À propos", services: "Services", subscriptions: "Abonnements", projects: "Projets", contact: "Contact", start: "Démarrer", account: "Mon compte" },
  es: { home: "Inicio", about: "Nosotros", services: "Servicios", subscriptions: "Planes", projects: "Proyectos", contact: "Contacto", start: "Empezar proyecto", account: "Mi cuenta" },
} as const;

export function SiteHeader({ signedIn = false, userName }: SiteHeaderProps) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const base = `/${locale}`;
  const c = navCopy[locale];
  const links = [
    { href: base, label: c.home },
    { href: `${base}/about`, label: c.about },
    { href: `${base}/services`, label: c.services },
    { href: `${base}/subscriptions`, label: c.subscriptions },
    { href: `${base}/projects`, label: c.projects },
    { href: `${base}/contact`, label: c.contact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-black text-white">
      <div className="container-x flex min-h-[82px] items-center gap-4 py-2">
        <Link href={base} className="shrink-0 [&_svg]:h-12 [&_svg]:w-12 [&>span>span]:!text-white"><BrandLogo /></Link>
        <nav className="mx-auto hidden items-center gap-0.5 xl:flex">
          {links.map((link) => { const active = link.href === base ? pathname === base : pathname.startsWith(link.href); return <Link key={link.href} href={link.href} className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-white/10 text-neon-cyan" : "text-white/80 hover:bg-white/10 hover:text-white"}`}>{link.label}</Link>; })}
        </nav>
        <div className="ms-auto flex items-center gap-2 xl:ms-0">
          <LanguageSwitcher />
          {signedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="unstyled" size="auto" className="rounded-xl border border-white/20 px-3 py-2 text-white"><UserRound className="size-4"/><span className="hidden sm:inline">{userName?.split(" ")[0] || c.account}</span><ChevronDown className="size-3"/></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end"><DropdownMenuItem asChild><Link href={`${base}/portal`}>{c.account}</Link></DropdownMenuItem><form action={signOutAction}><input type="hidden" name="locale" value={locale}/><Button type="submit" variant="ghost" className="w-full justify-start">{t.auth.signOut}</Button></form></DropdownMenuContent>
            </DropdownMenu>
          ) : <><Button asChild variant="unstyled" size="auto" className="hidden rounded-xl border border-white/20 px-3 py-2.5 font-semibold text-white transition hover:bg-white/10 xl:inline-flex"><Link href={`${base}/login`}><LogIn className="size-4"/>{t.auth.signIn}</Link></Button><Button asChild variant="unstyled" size="auto" className="hidden rounded-xl bg-neon-cyan px-5 py-3 font-bold text-black transition hover:bg-white sm:inline-flex"><Link href={`${base}/create-project`}>{c.start}<ArrowUpLeft className="size-4 flip-x"/></Link></Button></>}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button variant="unstyled" size="auto" aria-label={t.nav.menu} className="rounded-xl border border-white/20 p-2.5 text-white xl:hidden"><Menu className="size-5"/></Button></SheetTrigger>
            <SheetContent side="end" className="bg-[#f7f3ee] text-black xl:hidden"><SheetHeader><SheetTitle><BrandLogo /></SheetTitle></SheetHeader><nav className="mt-8 flex flex-col gap-2">{links.map((link) => <SheetClose asChild key={link.href}><Link href={link.href} className="rounded-xl border border-black/10 bg-white px-4 py-3 font-semibold">{link.label}</Link></SheetClose>)}</nav><Button asChild variant="neon" className="mt-6 w-full"><Link href={`${base}/create-project`}>{c.start}</Link></Button>{!signedIn && <Button asChild variant="ghostNeon" className="mt-2 w-full"><Link href={`${base}/login`}><LogIn className="size-4"/>{t.auth.signIn}</Link></Button>}</SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
