"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Globe, Search } from "lucide-react";
import { useI18n } from "@/components/providers";
import { localeMeta, locales, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const flagCountry: Partial<Record<Locale, string>> = { ar: "sa", en: "gb", uk: "ua", zh: "cn", ja: "jp", ko: "kr" };

/**
 * Locale picker.
 *
 * Radix DropdownMenu replaces the previous hand-rolled popover, which needed
 * its own outside-click and Escape listeners and still lacked roving focus.
 * Radix also restores focus to the trigger on close and manages aria-expanded.
 */
export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const visibleLocales = locales.filter((language) =>
    `${language} ${localeMeta[language].name} ${localeMeta[language].native}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );

  function switchTo(next: Locale) {
    if (next === locale) return;
    const segments = pathname.split("/");
    segments[1] = next;
    // Assigning document.cookie is a browser API call, not a mutation of a
    // React value; the compiler cannot distinguish the two.
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `awwa-locale=${next}; path=/; max-age=31536000; samesite=lax${window.location.protocol === "https:" ? "; secure" : ""}`;
    router.push((segments.join("/") || `/${next}`) + window.location.search + window.location.hash);
    router.refresh();
  }

  return (
    <DropdownMenu modal={false} dir={locale === "ar" ? "rtl" : "ltr"} onOpenChange={() => setQuery("")}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="unstyled"
          size="auto"
          type="button"
          aria-label={t.common.language}
          className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/[0.04] px-3 py-2
                     text-sm font-medium text-white transition-colors hover:border-neon-cyan hover:text-neon-cyan"
        >
          <Image aria-hidden alt="" src={`/flags/${flagCountry[locale] ?? locale}.svg`} width={20} height={15} unoptimized className="shrink-0 rounded-sm" />
          <span className="hidden sm:inline">{localeMeta[locale].native}</span>
          <span className="font-mono text-xs sm:hidden">{locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>

      {/* `align="end"` is direction-aware in Radix, so the menu hugs the
          correct edge under both LTR and RTL. */}
      <DropdownMenuContent align="end" sideOffset={12} className="w-[min(90vw,24rem)] rounded-2xl border-white/20 bg-[#101216] p-3 text-white">
        <div className="mb-3 flex items-center justify-between gap-3 px-1 py-1">
          <span className="flex items-center gap-2 text-sm font-semibold"><Globe className="h-4 w-4" />{t.common.language}</span>
          <span className="rounded-lg border border-white/15 px-2 py-1 font-mono text-xs text-white/60">{locales.length}</span>
        </div>
        <div className="relative mb-3">
          <Search aria-hidden className="pointer-events-none absolute start-3 top-3 h-4 w-4 text-white/50" />
          <Input
            aria-label={t.common.search}
            placeholder={t.common.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => { if (event.key.length === 1 || event.key === "Backspace" || event.key === "Delete" || event.key === "Home" || event.key === "End") event.stopPropagation(); }}
            className="h-10 border-white/20 bg-white/[0.04] ps-9 text-white placeholder:text-white/45"
          />
        </div>
        <div className="grid max-h-[min(55dvh,25rem)] grid-cols-2 gap-1.5 overflow-y-auto overscroll-contain p-0.5">
          {visibleLocales.map((l) => (
            <DropdownMenuCheckboxItem
              key={l}
              checked={l === locale}
              onSelect={() => switchTo(l)}
              className={`min-h-14 rounded-xl border py-2 ps-3 pe-7 [&>span:first-child]:start-auto [&>span:first-child]:end-2 ${l === locale ? "border-white bg-white text-black focus:bg-white focus:text-black" : "border-white/10 text-white/85 focus:bg-white/10 focus:text-white"}`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <Image aria-hidden alt="" src={`/flags/${flagCountry[l] ?? l}.svg`} width={24} height={18} unoptimized className="shrink-0 rounded-sm" />
                <span className="min-w-0"><span className="block whitespace-normal break-words text-xs font-medium leading-relaxed sm:text-sm" lang={l}>{localeMeta[l].native}</span><span className="block text-[10px] uppercase opacity-60">{l}</span></span>
              </span>
            </DropdownMenuCheckboxItem>
          ))}
        </div>
        {visibleLocales.length === 0 && <p role="status" className="px-3 py-5 text-center text-sm text-white/60">{t.common.empty}</p>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
