/**
 * Shared contact-field validation.
 *
 * The exact same functions run in the browser (for instant feedback) and in the
 * server actions (as the authoritative check) — a client-side `pattern` or
 * `type="email"` is trivially bypassed with a crafted POST, so nothing here may
 * live only in the component.
 */
import { findCountry, type Country } from "./countries";

/* ------------------------------------------------------------------ *
 * Digit normalisation
 * ------------------------------------------------------------------ */

/** Arabic-Indic ٠١٢٣٤٥٦٧٨٩ and Eastern Arabic-Indic ۰۱۲۳۴۵۶۷۸۹ → 0-9. */
export function toAsciiDigits(input: string): string {
  return input.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (ch) => {
    const code = ch.charCodeAt(0);
    const base = code >= 0x06f0 ? 0x06f0 : 0x0660;
    return String(code - base);
  });
}

/** Strips every character that is not an ASCII digit, after normalising. */
export function digitsOnly(input: string): string {
  return toAsciiDigits(input).replace(/\D/g, "");
}

/**
 * True when the raw input contains a character that can never be part of a
 * phone number (i.e. a letter). Used to reject typed letters outright.
 */
export function hasLetters(input: string): boolean {
  return /\p{L}/u.test(toAsciiDigits(input));
}

/* ------------------------------------------------------------------ *
 * Phone
 * ------------------------------------------------------------------ */

export type PhoneErrorCode = "letters" | "required" | "country" | "length";

export interface PhoneResult {
  ok: boolean;
  /** E.164, e.g. `+31612345678`. Only set when `ok`. */
  e164?: string;
  code?: PhoneErrorCode;
  /** Expected national length, for a helpful message. */
  expected?: { min: number; max: number };
}

/**
 * Validates a national number against its country and returns E.164.
 * A leading trunk `0` (NL/GB/TR/DE… style) is dropped, as E.164 requires.
 */
export function validatePhone(
  countryIso: string,
  rawNational: string,
  { required = false }: { required?: boolean } = {},
): PhoneResult {
  const country: Country | undefined = findCountry(countryIso);
  if (!country) return { ok: false, code: "country" };

  const raw = rawNational.trim();
  if (!raw) {
    return required ? { ok: false, code: "required" } : { ok: true };
  }
  if (hasLetters(raw)) return { ok: false, code: "letters" };

  let national = digitsOnly(raw);
  while (national.startsWith("0")) national = national.slice(1);

  if (national.length < country.min || national.length > country.max) {
    return { ok: false, code: "length", expected: { min: country.min, max: country.max } };
  }
  return { ok: true, e164: `+${country.dial}${national}` };
}

/* ------------------------------------------------------------------ *
 * Email
 * ------------------------------------------------------------------ */

/**
 * ASCII-only address. Deliberately rejects Arabic (and every other non-ASCII
 * script): our transactional provider and the downstream CRM are not
 * IDN/SMTPUTF8 capable, so a Unicode address would silently bounce.
 */
const ASCII_EMAIL =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

export type EmailErrorCode = "nonAscii" | "format" | "required";

export interface EmailResult {
  ok: boolean;
  value?: string;
  code?: EmailErrorCode;
}

export function validateEmail(raw: string): EmailResult {
  const value = raw.trim().toLowerCase();
  if (!value) return { ok: false, code: "required" };
  if (/[^\x00-\x7F]/.test(value)) return { ok: false, code: "nonAscii" };
  if (value.length > 254) return { ok: false, code: "format" };
  const [local] = value.split("@");
  if (!local || local.length > 64) return { ok: false, code: "format" };
  if (value.includes("..")) return { ok: false, code: "format" };
  if (!ASCII_EMAIL.test(value)) return { ok: false, code: "format" };
  return { ok: true, value };
}
