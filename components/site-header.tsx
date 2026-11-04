"use client";
import { withExtraLocales } from "@/lib/i18n/extra-locales";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { ArrowUpLeft, ChevronDown, FolderKanban, LogOut, Menu, Settings, UserRound } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { useI18n } from "@/components/providers";
import { publishedWork, validWork } from "@/lib/public-work";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/ui/switchers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface SiteHeaderProps { signedIn?: boolean; userName?: string; userImage?: string; canAdmin?: boolean }

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function getScrolledSnapshot() { return window.scrollY > 32; }
function getServerScrolledSnapshot() { return false; }

const navCopy = withExtraLocales({
  ar: { home: "الرئيسية",  services: "الخدمات",   projects: "أعمالنا",  contact: "اتصل بنا",  start: "ابدأ مشروعك", account: "الملف الشخصي", allProjects: "جميع المشاريع", settings: "الإعدادات" },
  en: { home: "Home",  services: "Services",   projects: "Work",  contact: "Contact",  start: "Start a project", account: "Profile", allProjects: "All projects", settings: "Settings" },
  nl: { home: "Home",  services: "Diensten",   projects: "Werk",  contact: "Contact",  start: "Start een project", account: "Profiel", allProjects: "Alle projecten", settings: "Instellingen" },
  de: { home: "Start",  services: "Leistungen",   projects: "Projekte",  contact: "Kontakt",  start: "Projekt starten", account: "Profil", allProjects: "Alle Projekte", settings: "Einstellungen" },
  tr: { home: "Ana sayfa",  services: "Hizmetler",   projects: "Projeler",  contact: "İletişim",  start: "Proje başlat", account: "Profil", allProjects: "Tüm projeler", settings: "Ayarlar" },
  fr: { home: "Accueil",  services: "Services",   projects: "Projets",  contact: "Contact",  start: "Démarrer", account: "Profil", allProjects: "Tous les projets", settings: "Paramètres" },
  es: { home: "Inicio",  services: "Servicios",   projects: "Proyectos",  contact: "Contacto",  start: "Empezar proyecto", account: "Perfil", allProjects: "Todos los proyectos", settings: "Ajustes" },
} as const);

export function SiteHeader({ signedIn = false, userName, userImage, canAdmin = false }: SiteHeaderProps) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(subscribeToScroll, getScrolledSnapshot, getServerScrolledSnapshot);
  const [open, setOpen] = useState(false);
  const base = `/${locale}`;
  const c = navCopy[locale];
  const isHome = pathname === base || pathname === `${base}/`;
  const hasWork = publishedWork.some(validWork);
  const links = [
    { href: base, label: c.home },
    { href: `${base}/services`, label: c.services },
    ...(hasWork ? [{ href: `${base}/work`, label: c.projects }] : []),
    { href: `${base}/contact`, label: c.contact },
  ];
  const primaryPaths = ["", "/services", ...(hasWork ? ["/work"] : []), "/contact"];
  const primaryLinks = links.filter(link=>primaryPaths.some(path=>link.href===`${base}${path}`));
  const moreLinks = links.filter(link=>!primaryLinks.includes(link));

  return (
    <header className={`home-floating-nav studio-nav text-white ${scrolled ? "home-floating-nav-scrolled" : ""} ${isHome ? "" : "home-floating-nav-page"}`}>
      <div className="container-x home-floating-nav-inner flex items-center gap-2 py-2 sm:gap-4">
        <Link href={base} data-scroll-top aria-label={c.home} className="shrink-0 [&_svg]:h-10 [&_svg]:w-10 sm:[&_svg]:h-12 sm:[&_svg]:w-12 [&>span>span]:hidden sm:[&>span>span]:inline [&>span>span]:!text-white"><BrandLogo /></Link>
        <nav className="mx-auto hidden items-center home-floating-nav-links xl:flex">
          {primaryLinks.map(link=><Link key={link.href} href={link.href} className="home-floating-nav-link" aria-current={(link.href===base?pathname===base:pathname.startsWith(link.href))?"page":undefined}>{link.label}</Link>)}
          {!isHome && moreLinks.length > 0 && <DropdownMenu modal={false}><DropdownMenuTrigger asChild><Button variant="unstyled" size="auto" className="home-floating-nav-link">{t.nav.menu}<ChevronDown className="size-3"/></Button></DropdownMenuTrigger><DropdownMenuContent className="border-white/20 bg-[#101216] text-white">{moreLinks.map(link=><DropdownMenuItem key={link.href} asChild><Link href={link.href}>{link.label}</Link></DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>}
        </nav>
        <div className="ms-auto flex shrink-0 items-center gap-2 2xl:ms-0">
          <LanguageSwitcher />
          {signedIn ? (
            <DropdownMenu modal={false} dir={locale === "ar" ? "rtl" : "ltr"}>
              <DropdownMenuTrigger asChild><Button variant="unstyled" size="auto" aria-label={c.account} className="rounded-full border border-white/20 p-1 text-white"><Avatar className="size-9 border border-white/15"><AvatarImage src={userImage} alt={userName || c.account}/><AvatarFallback className="bg-white text-black">{userName?.trim().charAt(0).toUpperCase() || <UserRound className="size-4"/>}</AvatarFallback></Avatar><ChevronDown className="me-1 size-3"/></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-56 border-white/20 bg-[#101216] text-white"><div className="px-3 py-2"><p className="font-bold text-white">{userName || c.account}</p><p className="text-xs text-white/55">{c.account}</p></div><DropdownMenuItem asChild><Link href={`${base}/portal/profile`}><UserRound className="size-4"/>{c.account}</Link></DropdownMenuItem><DropdownMenuItem asChild><Link href={`${base}/portal`}><FolderKanban className="size-4"/>{c.allProjects}</Link></DropdownMenuItem>{canAdmin && <DropdownMenuItem asChild><Link href={`${base}/admin`}><Settings className="size-4"/>{locale === "ar" ? "الإدارة" : locale === "nl" ? "Beheer" : "Administration"}</Link></DropdownMenuItem>}<DropdownMenuItem asChild><Link href={`${base}/portal/profile#settings`}><Settings className="size-4"/>{c.settings}</Link></DropdownMenuItem><form action={signOutAction}><Input type="hidden" name="locale" value={locale}/><Button type="submit" variant="ghost" className="w-full justify-start text-white hover:bg-white/10 hover:text-white"><LogOut className="size-4"/>{t.auth.signOut}</Button></form></DropdownMenuContent>
            </DropdownMenu>
          ) : <>{!isHome && <Button asChild variant="unstyled" size="auto" className="hidden rounded-xl bg-neon-cyan px-5 py-3 font-bold text-black transition hover:bg-white sm:inline-flex"><Link href={`${base}/contact#inquiry`}>{c.start}<ArrowUpLeft className="size-4 flip-x"/></Link></Button>}</>}
          {isHome && <Button asChild variant="neon" size="sm" className="hidden md:inline-flex"><Link href={`${base}/contact#inquiry`}>{c.start}<ArrowUpLeft className="size-4 flip-x"/></Link></Button>}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button variant="unstyled" size="auto" aria-label={t.nav.menu} className={`rounded-xl border border-white/20 p-2.5 text-white ${isHome ? '' : 'xl:hidden'}`}><Menu className="size-5"/></Button></SheetTrigger>
            <SheetContent side="end" className={`bs-public-menu bg-[#101216] text-white ${isHome ? 'cinema-menu' : 'xl:hidden'}`}><SheetHeader><SheetTitle className="text-white"><BrandLogo className="[&>span]:!text-white"/></SheetTitle></SheetHeader><nav className="mt-8 flex flex-col gap-2">{links.map((link) => <SheetClose asChild key={link.href}><Link href={link.href} className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-semibold">{link.label}</Link></SheetClose>)}</nav><SheetClose asChild><Button asChild variant="neon" className="mt-6 w-full"><Link href={`${base}/contact#inquiry`}>{c.start}</Link></Button></SheetClose></SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
