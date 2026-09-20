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
    document.cookie = `awwa-locale=${next}; path=/; max-age=31536000; samesite=lax`;
    router.push(segments.join("/") || `/${next}`);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="unstyled"
          size="auto"
          type="button"
          aria-label={t.common.language}
          className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-white/[0.02] px-3 py-2
                     text-sm font-medium text-ink-mid transition-colors hover:border-neon-cyan/50 hover:text-white"
        >
          <Globe className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">{localeMeta[locale].native}</span>
          <span className="font-mono text-xs sm:hidden">{locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>

      {/* `align="end"` is direction-aware in Radix, so the menu hugs the
          correct edge under both LTR and RTL. */}
      <DropdownMenuContent align="end" className="w-52">
        {locales.map((l) => (
          <DropdownMenuCheckboxItem key={l} checked={l === locale} onSelect={() => switchTo(l)}>
            <span className="flex items-center gap-2">
              <span aria-hidden>{localeMeta[l].flag}</span>
              {localeMeta[l].native}
            </span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
