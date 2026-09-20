/**
 * Dial-code table used by the phone field and by the server-side validator.
 *
 * `min`/`max` are the length of the *national* number (without the dial code).
 * Values follow ITU E.164 national significant number lengths; where a country
 * has several plans the range covers them all.
 */
export interface Country {
  /** ISO 3166-1 alpha-2. */
  iso: string;
  /** E.164 country calling code, digits only, no `+`. */
  dial: string;
  /** English name — searchable. */
  name: string;
  /** Native/local name — also searchable. */
  native: string;
  flag: string;
  min: number;
  max: number;
}

export const countries: Country[] = [
  { iso: "NL", dial: "31", name: "Netherlands", native: "Nederland", flag: "🇳🇱", min: 9, max: 9 },
  { iso: "SA", dial: "966", name: "Saudi Arabia", native: "السعودية", flag: "🇸🇦", min: 9, max: 9 },
  { iso: "AE", dial: "971", name: "United Arab Emirates", native: "الإمارات", flag: "🇦🇪", min: 9, max: 9 },
  { iso: "TR", dial: "90", name: "Türkiye", native: "Türkiye", flag: "🇹🇷", min: 10, max: 10 },
  { iso: "GB", dial: "44", name: "United Kingdom", native: "United Kingdom", flag: "🇬🇧", min: 9, max: 10 },
  { iso: "US", dial: "1", name: "United States", native: "United States", flag: "🇺🇸", min: 10, max: 10 },
  { iso: "CA", dial: "1", name: "Canada", native: "Canada", flag: "🇨🇦", min: 10, max: 10 },
  { iso: "DE", dial: "49", name: "Germany", native: "Deutschland", flag: "🇩🇪", min: 10, max: 11 },
  { iso: "FR", dial: "33", name: "France", native: "France", flag: "🇫🇷", min: 9, max: 9 },
  { iso: "ES", dial: "34", name: "Spain", native: "España", flag: "🇪🇸", min: 9, max: 9 },
  { iso: "BE", dial: "32", name: "Belgium", native: "België", flag: "🇧🇪", min: 8, max: 9 },
  { iso: "IT", dial: "39", name: "Italy", native: "Italia", flag: "🇮🇹", min: 9, max: 10 },
  { iso: "PT", dial: "351", name: "Portugal", native: "Portugal", flag: "🇵🇹", min: 9, max: 9 },
  { iso: "CH", dial: "41", name: "Switzerland", native: "Schweiz", flag: "🇨🇭", min: 9, max: 9 },
  { iso: "AT", dial: "43", name: "Austria", native: "Österreich", flag: "🇦🇹", min: 10, max: 11 },
  { iso: "SE", dial: "46", name: "Sweden", native: "Sverige", flag: "🇸🇪", min: 7, max: 9 },
  { iso: "NO", dial: "47", name: "Norway", native: "Norge", flag: "🇳🇴", min: 8, max: 8 },
  { iso: "DK", dial: "45", name: "Denmark", native: "Danmark", flag: "🇩🇰", min: 8, max: 8 },
  { iso: "FI", dial: "358", name: "Finland", native: "Suomi", flag: "🇫🇮", min: 9, max: 10 },
  { iso: "IE", dial: "353", name: "Ireland", native: "Éire", flag: "🇮🇪", min: 9, max: 9 },
  { iso: "PL", dial: "48", name: "Poland", native: "Polska", flag: "🇵🇱", min: 9, max: 9 },
  { iso: "CZ", dial: "420", name: "Czechia", native: "Česko", flag: "🇨🇿", min: 9, max: 9 },
  { iso: "GR", dial: "30", name: "Greece", native: "Ελλάδα", flag: "🇬🇷", min: 10, max: 10 },
  { iso: "RO", dial: "40", name: "Romania", native: "România", flag: "🇷🇴", min: 9, max: 9 },
  { iso: "EG", dial: "20", name: "Egypt", native: "مصر", flag: "🇪🇬", min: 10, max: 10 },
  { iso: "QA", dial: "974", name: "Qatar", native: "قطر", flag: "🇶🇦", min: 8, max: 8 },
  { iso: "KW", dial: "965", name: "Kuwait", native: "الكويت", flag: "🇰🇼", min: 8, max: 8 },
  { iso: "BH", dial: "973", name: "Bahrain", native: "البحرين", flag: "🇧🇭", min: 8, max: 8 },
  { iso: "OM", dial: "968", name: "Oman", native: "عُمان", flag: "🇴🇲", min: 8, max: 8 },
  { iso: "JO", dial: "962", name: "Jordan", native: "الأردن", flag: "🇯🇴", min: 9, max: 9 },
  { iso: "LB", dial: "961", name: "Lebanon", native: "لبنان", flag: "🇱🇧", min: 7, max: 8 },
  { iso: "IQ", dial: "964", name: "Iraq", native: "العراق", flag: "🇮🇶", min: 10, max: 10 },
  { iso: "SY", dial: "963", name: "Syria", native: "سوريا", flag: "🇸🇾", min: 9, max: 9 },
  { iso: "YE", dial: "967", name: "Yemen", native: "اليمن", flag: "🇾🇪", min: 9, max: 9 },
  { iso: "PS", dial: "970", name: "Palestine", native: "فلسطين", flag: "🇵🇸", min: 9, max: 9 },
  { iso: "LY", dial: "218", name: "Libya", native: "ليبيا", flag: "🇱🇾", min: 9, max: 9 },
  { iso: "SD", dial: "249", name: "Sudan", native: "السودان", flag: "🇸🇩", min: 9, max: 9 },
  { iso: "MA", dial: "212", name: "Morocco", native: "المغرب", flag: "🇲🇦", min: 9, max: 9 },
  { iso: "DZ", dial: "213", name: "Algeria", native: "الجزائر", flag: "🇩🇿", min: 9, max: 9 },
  { iso: "TN", dial: "216", name: "Tunisia", native: "تونس", flag: "🇹🇳", min: 8, max: 8 },
  { iso: "IN", dial: "91", name: "India", native: "भारत", flag: "🇮🇳", min: 10, max: 10 },
  { iso: "PK", dial: "92", name: "Pakistan", native: "پاکستان", flag: "🇵🇰", min: 10, max: 10 },
  { iso: "BD", dial: "880", name: "Bangladesh", native: "বাংলাদেশ", flag: "🇧🇩", min: 10, max: 10 },
  { iso: "ID", dial: "62", name: "Indonesia", native: "Indonesia", flag: "🇮🇩", min: 9, max: 12 },
  { iso: "MY", dial: "60", name: "Malaysia", native: "Malaysia", flag: "🇲🇾", min: 9, max: 10 },
  { iso: "SG", dial: "65", name: "Singapore", native: "Singapore", flag: "🇸🇬", min: 8, max: 8 },
  { iso: "CN", dial: "86", name: "China", native: "中国", flag: "🇨🇳", min: 11, max: 11 },
  { iso: "JP", dial: "81", name: "Japan", native: "日本", flag: "🇯🇵", min: 10, max: 10 },
  { iso: "KR", dial: "82", name: "South Korea", native: "대한민국", flag: "🇰🇷", min: 9, max: 10 },
  { iso: "AU", dial: "61", name: "Australia", native: "Australia", flag: "🇦🇺", min: 9, max: 9 },
  { iso: "NZ", dial: "64", name: "New Zealand", native: "New Zealand", flag: "🇳🇿", min: 8, max: 10 },
  { iso: "ZA", dial: "27", name: "South Africa", native: "South Africa", flag: "🇿🇦", min: 9, max: 9 },
  { iso: "NG", dial: "234", name: "Nigeria", native: "Nigeria", flag: "🇳🇬", min: 10, max: 10 },
  { iso: "KE", dial: "254", name: "Kenya", native: "Kenya", flag: "🇰🇪", min: 9, max: 9 },
  { iso: "BR", dial: "55", name: "Brazil", native: "Brasil", flag: "🇧🇷", min: 10, max: 11 },
  { iso: "MX", dial: "52", name: "Mexico", native: "México", flag: "🇲🇽", min: 10, max: 10 },
  { iso: "AR", dial: "54", name: "Argentina", native: "Argentina", flag: "🇦🇷", min: 10, max: 10 },
  { iso: "CL", dial: "56", name: "Chile", native: "Chile", flag: "🇨🇱", min: 9, max: 9 },
  { iso: "CO", dial: "57", name: "Colombia", native: "Colombia", flag: "🇨🇴", min: 10, max: 10 },
  { iso: "RU", dial: "7", name: "Russia", native: "Россия", flag: "🇷🇺", min: 10, max: 10 },
  { iso: "UA", dial: "380", name: "Ukraine", native: "Україна", flag: "🇺🇦", min: 9, max: 9 },
];

/** Default selection per UI locale, so the field opens on a sensible country. */
export const localeDefaultCountry: Record<string, string> = {
  ar: "SA",
  en: "GB",
  nl: "NL",
  de: "DE",
  tr: "TR",
  fr: "FR",
  es: "ES",
};

export function findCountry(iso: string): Country | undefined {
  return countries.find((c) => c.iso === iso);
}
