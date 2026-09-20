"use client";

import Link from "next/link";
import { ArrowRight, Hexagon, Mail } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  const { locale, t } = useI18n();
  const base = `/${locale}`;

  return (
    <footer className="relative overflow-hidden border-t border-line bg-elevated/80 backdrop-blur-md">
      {/* Top glow seam */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/60 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full bg-neon-cyan/10 blur-[110px]"
      />

      <div className="container-x relative grid gap-12 py-16 text-start md:grid-cols-2 lg:grid-cols-4">
        {/* Brand + newsletter */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-white via-white to-slate-300 text-black shadow-glow-cyan">
              <Hexagon className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="text-sm font-black tracking-widest">AAKWHX</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-low">
            {t.brand.tagline} {t.footer.built}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-ink-faint">{t.footer.offices}</p>

          {/* Newsletter */}
          <div className="mt-7 max-w-sm">
            <h3 className="mono-label">{t.footer.newsletterTitle}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-low">Newsletter registration will be available shortly.</p>
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="mono-label">{t.nav.services}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-low">
            {t.services.items.slice(0, 5).map((s) => (
              <li key={s.title}>
                <Link href={`${base}/quote`} className="inline-flex items-center gap-1.5 transition-colors hover:text-neon-cyan">
                  <ArrowRight className="h-3 w-3 shrink-0 flip-x opacity-0 transition-opacity duration-300 hover:opacity-100" />
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mono-label">{t.nav.contact}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-low">
            <li>
              <Link href={`${base}/quote`} className="hover:text-neon-cyan">
                {t.nav.quote}
              </Link>
            </li>
            <li>
              <Link href={`${base}/portal`} className="hover:text-neon-cyan">
                {t.nav.portal}
              </Link>
            </li>
            <li>
              <Link href={`${base}/admin`} className="hover:text-neon-cyan">
                {t.nav.admin}
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> <a href="mailto:hello@aakwhx.com" className="hover:text-neon-cyan">hello@aakwhx.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-line py-5 text-center text-xs text-ink-faint">
        <div className="container-x flex flex-col items-center justify-between gap-3 sm:flex-row">
          <span>© {new Date().getFullYear()} AAKWHX · AWWA. {t.footer.rights}</span>
          <span className="flex items-center gap-4">
            <Link href={`${base}/privacy`} className="transition-colors hover:text-neon-cyan">Privacy</Link>
            <Link href={`${base}/terms`} className="transition-colors hover:text-neon-cyan">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
