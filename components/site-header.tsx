"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { LogIn, Menu, UserRound, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/app/actions/auth";
import { useI18n } from "@/components/providers";
import { LanguageSwitcher } from "@/components/ui/switchers";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";

export interface SiteHeaderProps {
  /** Resolved on the server so the correct auth links render on first paint. */
  signedIn?: boolean;
  userName?: string;
}

export function SiteHeader({ signedIn = false, userName }: SiteHeaderProps) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Reading-progress bar — runs entirely on the compositor (scaleX on a
     GPU layer), so it costs nothing while scrolling. */
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  /**
   * Close the mobile menu on navigation by DERIVING it during render rather
   * than firing an effect. The effect version rendered the open menu on the
   * new route first and closed it on a second pass; this closes it in the
   * same commit and costs no extra render.
   */
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const base = `/${locale}`;
  const accountLabel = { ar: "حسابي", en: "My account", nl: "Mijn account", de: "Mein Konto", tr: "Hesabım", fr: "Mon compte", es: "Mi cuenta" }[locale];
  const extra = locale === "ar"
    ? { projects: "المشاريع", create: "اصنع مشروعًا", contact: "تواصل" }
    : { projects: "Projects", create: "Start a project", contact: "Contact" };
  const links = [
    { href: `${base}#services`, label: t.nav.services },
    { href: `${base}/projects`, label: extra.projects },
    { href: `${base}/create-project`, label: extra.create },
    { href: `${base}/contact`, label: extra.contact },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full px-3 pt-3 transition-all duration-300 sm:px-5",
        scrolled ? "pb-2" : "pb-1",
      )}
    >
      <div className={cn("header-shell container-x relative flex min-h-16 items-center gap-2 py-2 sm:gap-4", scrolled && "header-shell-scrolled")}>
        <motion.span aria-hidden style={{ scaleX: progress }} className="absolute inset-x-5 bottom-0 h-px origin-inline-start bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        <Link href={base} className="shrink-0 transition-opacity hover:opacity-90"><BrandLogo className="max-sm:gap-1 max-sm:[&>span]:hidden" /></Link>

        {/* Nav — animated underline sweep on hover */}
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group/link relative whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-ink-low transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              {l.label}
              <span
                aria-hidden
                className="absolute inset-x-4 bottom-1 h-px origin-inline-start scale-x-0 bg-white/80 transition-transform duration-300 group-hover/link:scale-x-100"
              />
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-2">
            {signedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghostNeon" aria-label={accountLabel} className="max-w-36 !gap-1.5 !px-3 !py-2 !text-xs"><UserRound className="size-4 shrink-0"/><span className="truncate">{userName?.split(" ")[0] || accountLabel}</span><ChevronDown className="size-3 shrink-0"/></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild><Link href={`${base}/portal`}>{accountLabel}</Link></DropdownMenuItem>
                  <form action={signOutAction}><input type="hidden" name="locale" value={locale}/><Button type="submit" variant="ghost" className="w-full justify-start">{t.auth.signOut}</Button></form>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="neon" className="whitespace-nowrap !px-3 !py-2 !text-xs">
                <Link href={`${base}/login`}>
                  <LogIn className="h-4 w-4 shrink-0" />
                  {t.auth.signIn}
                </Link>
              </Button>
            )}
          </div>

          <LanguageSwitcher />

          {/* Radix Sheet: focus trap, scroll lock, Escape and focus restore. */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="unstyled"
                size="auto"
                type="button"
                aria-label={t.nav.menu}
                className="rounded-xl border border-line-strong bg-white/[0.02] p-2.5 text-ink-mid transition-colors hover:border-neon-cyan/50 hover:text-white lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="end" className="lg:hidden">
              <SheetHeader>
                <SheetTitle>{t.nav.menu}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                {[
                  ...links,
                  signedIn
                    ? { href: `${base}/portal`, label: t.auth.dashboard }
                    : { href: `${base}/login`, label: t.auth.signIn },
                ].map((l) => (
                  <SheetClose asChild key={l.href}>
                    <Link
                      href={l.href}
                      className="rounded-lg px-3 py-2.5 text-start text-sm font-medium text-ink-mid transition-colors hover:bg-white/[0.05] hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              {signedIn && <form action={signOutAction}><input type="hidden" name="locale" value={locale} /><Button type="submit" variant="ghostNeon">{t.auth.signOut}</Button></form>}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
