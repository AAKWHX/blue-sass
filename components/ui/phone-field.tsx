"use client";

/**
 * International phone input: searchable country dropdown (flag + dial code)
 * next to a digits-only national number box.
 *
 * The visible input is uncontrolled by the form; what actually gets submitted
 * is a hidden field holding the E.164 value, plus the selected ISO code so the
 * server can re-run the exact same length check.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { countries, localeDefaultCountry, type Country } from "@/lib/validation/countries";
import { digitsOnly, hasLetters, validatePhone } from "@/lib/validation/contact";

export interface PhoneFieldStrings {
  country: string;
  search: string;
  noResults: string;
  placeholder: string;
  hint: string;
  errLetters: string;
  errLength: string;
  digitsRange: string;
}

export function PhoneField({
  name = "phone",
  countryName = "phoneCountry",
  locale,
  strings,
  required = false,
  serverError,
  id = "phone",
}: {
  name?: string;
  countryName?: string;
  locale: string;
  strings: PhoneFieldStrings;
  required?: boolean;
  serverError?: string;
  id?: string;
}) {
  const [iso, setIso] = useState(() => localeDefaultCountry[locale] ?? "NL");
  const [national, setNational] = useState("");
  const [touched, setTouched] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const country = useMemo(
    () => countries.find((c) => c.iso === iso) ?? countries[0],
    [iso],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.native.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        c.dial.startsWith(q),
    );
  }, [query]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    searchRef.current?.focus();
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const result = validatePhone(iso, national, { required });
  const clientError =
    touched && !result.ok
      ? result.code === "letters"
        ? strings.errLetters
        : result.code === "length"
          ? strings.errLength.replace(
              "{expected}",
              country.min === country.max
                ? String(country.min)
                : strings.digitsRange
                    .replace("{min}", String(country.min))
                    .replace("{max}", String(country.max)),
            )
          : strings.errLetters
      : undefined;
  const error = clientError ?? serverError;

  /** Letters are dropped as they are typed; Arabic-Indic digits are converted. */
  function onChange(value: string) {
    if (hasLetters(value)) setTouched(true);
    setNational(digitsOnly(value));
  }

  function pick(next: Country) {
    setIso(next.iso);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={countryName} value={iso} />
      <input type="hidden" name={name} value={result.e164 ?? ""} />

      {/* Country selector and number share one bordered box, so the number
          keeps a usable width even inside a narrow grid column. */}
      <div
        className={cn(
          "flex w-full items-stretch overflow-hidden rounded-xl border border-line bg-white/[0.03] transition",
          "focus-within:border-neon-cyan/60 focus-within:ring-2 focus-within:ring-neon-cyan/20",
          error && "border-rose-500/60",
        )}
        dir="ltr"
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={strings.country}
          className="flex shrink-0 items-center gap-1.5 border-e border-line px-3 py-3 text-sm tabular-nums text-ink-hi outline-none hover:bg-white/[0.05]"
        >
          <span aria-hidden className="text-base leading-none">
            {country.flag}
          </span>
          <span className="font-medium">+{country.dial}</span>
          <ChevronDown className="size-3.5 opacity-60" />
        </button>

        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          // `min-w-0` is essential: without it the flex item refuses to shrink
          // below its intrinsic width and collapses the typing area.
          className="w-full min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-ink-hi outline-none placeholder:text-ink-faint"
          dir="ltr"
          maxLength={country.max}
          placeholder={"0".repeat(country.max)}
          value={national}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => setTouched(true)}
          onKeyDown={(event) => {
            if (event.key.length === 1 && /\p{L}/u.test(event.key)) {
              event.preventDefault();
              setTouched(true);
            }
          }}
        />

        <span
          className="shrink-0 self-center pe-3 text-xs tabular-nums text-ink-low"
          aria-hidden
        >
          {national.length}/{country.max}
        </span>
      </div>

      {open ? (
        <div className="absolute z-50 mt-2 w-full max-w-sm overflow-hidden rounded-xl border border-white/12 bg-[#0d1220] shadow-2xl">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
            <Search className="size-4 opacity-60" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={strings.search}
              className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-ink-low"
            />
          </div>
          <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
            {results.length === 0 ? (
              <li className="px-3 py-3 text-sm text-ink-low">{strings.noResults}</li>
            ) : (
              results.map((c) => (
                <li key={c.iso}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.iso === iso}
                    onClick={() => pick(c)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2 text-start text-sm hover:bg-white/8",
                      c.iso === iso && "bg-white/6",
                    )}
                  >
                    <span aria-hidden className="text-base leading-none">
                      {c.flag}
                    </span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="tabular-nums text-ink-low" dir="ltr">
                      +{c.dial}
                    </span>
                    {c.iso === iso ? <Check className="size-3.5 text-neon-cyan" /> : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-rose-400">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-low">
          {strings.hint}
        </p>
      )}
    </div>
  );
}

