"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useI18n } from "@/components/providers";
import { localeMeta, locales, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <DropdownMenu modal={false} dir={locale === "ar" ? "rtl" : "ltr"}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="unstyled"
          size="auto"
          type="button"
          aria-label={t.common.language}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/[0.04] px-2.5 py-2
                     text-sm font-medium text-white transition-colors hover:border-neon-cyan hover:text-neon-cyan"
        >
          <Globe aria-hidden size={15} />
          <span className="hidden sm:inline">{localeMeta[locale].native}</span>
          <span className="font-mono text-xs sm:hidden">{locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-44 rounded-xl border-white/20 bg-[#101216] p-1.5 text-white">
        <div className="grid gap-1">
          {locales.map((l) => (
            <DropdownMenuCheckboxItem
              key={l}
              checked={l === locale}
              onSelect={() => switchTo(l)}
              className={`min-h-11 rounded-lg border py-2 ps-3 pe-7 [&>span:first-child]:start-auto [&>span:first-child]:end-2 ${l === locale ? "border-white bg-white text-black focus:bg-white focus:text-black" : "border-white/10 text-white/85 focus:bg-white/10 focus:text-white"}`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span lang={l} className="text-sm">{localeMeta[l].native}</span>
              </span>
            </DropdownMenuCheckboxItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
