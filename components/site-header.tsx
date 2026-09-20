"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { LogIn, Menu } from "lucide-react";
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
}

export function SiteHeader({ signedIn = false }: SiteHeaderProps) {
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
  const links = [
    { href: `${base}#services`, label: t.nav.services },
    { href: `${base}#portfolio`, label: t.nav.portfolio },
    { href: `${base}#process`, label: t.nav.process },
    { href: `${base}/quote`, label: t.nav.quote },
  ];

  // Always dark + frosted, never transparent: over the animated 3D field a
  // transparent bar left the nav unreadable. Scrolling only deepens the tint
  // and adds the shadow.
  return (
    <header
      className={cn(
        // `sticky` already creates the positioning context for the hairline —
        // adding `relative` here made tailwind-merge drop `sticky` entirely.
        "sticky top-0 z-50 w-full border-b backdrop-blur-xl backdrop-saturate-150 transition-all duration-300",
        "supports-[backdrop-filter]:bg-base/70",
        scrolled
          ? "border-line bg-base/90 shadow-[0_10px_40px_-24px_rgba(0,0,0,1)] supports-[backdrop-filter]:bg-base/85"
          : "border-line/60 bg-base/80",
      )}
    >
      {/* Neon hairline along the bottom edge. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/45 to-transparent"
      />

      {/* Reading-progress line — neon gradient sweeping left→right (flips in RTL). */}
      <motion.span
        aria-hidden
        style={{ scaleX: progress }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-inline-start
                   bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-magenta
                   shadow-[0_0_12px_rgba(255,255,255,0.5)]"
      />

      <div className="container-x flex h-16 items-center gap-4">
        <Link href={base} className="shrink-0 transition-opacity hover:opacity-90"><BrandLogo /></Link>

        {/* Nav — animated underline sweep on hover */}
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group/link relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-ink-low transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              {l.label}
              <span
                aria-hidden
                className="absolute inset-x-3 bottom-1 h-px origin-inline-start scale-x-0 bg-gradient-to-r from-neon-cyan to-neon-magenta transition-transform duration-300 group-hover/link:scale-x-100"
              />
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            {signedIn ? (
              <form action={signOutAction}>
                <input type="hidden" name="locale" value={locale} />
                <Button type="submit" variant="ghostNeon" className="whitespace-nowrap !px-3 !py-2 !text-xs">
                  {t.auth.signOut}
                </Button>
              </form>
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
                aria-label="Menu"
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
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
