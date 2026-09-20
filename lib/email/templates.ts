/**
 * Email bodies. All copy comes from the locale dictionaries so the seven
 * supported languages stay in one place.
 */
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export function verificationEmail(locale: string, link: string) {
  const lang: Locale = isLocale(locale) ? locale : "en";
  const t = getDictionary(lang).emails.verify;
  const dir = lang === "ar" ? "rtl" : "ltr";

  const text = [t.heading, "", t.body, "", link, "", t.expiry, t.ignore].join("\n");

  const html = `<!doctype html>
<html lang="${lang}" dir="${dir}">
  <body style="margin:0;padding:32px 16px;background:#070a12;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#e6ecff">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#0d1220;border:1px solid #1e2a44;border-radius:16px;padding:32px" cellpadding="0" cellspacing="0" dir="${dir}">
          <tr><td style="font-size:13px;letter-spacing:.18em;color:#5eead4;text-transform:uppercase">AAKWHX</td></tr>
          <tr><td style="padding-top:12px;font-size:22px;font-weight:700">${t.heading}</td></tr>
          <tr><td style="padding-top:12px;font-size:15px;line-height:1.7;color:#aab6d4">${t.body}</td></tr>
          <tr><td style="padding-top:24px">
            <a href="${link}" style="display:inline-block;background:#22d3ee;color:#04121a;font-weight:700;font-size:15px;text-decoration:none;padding:13px 26px;border-radius:10px">${t.cta}</a>
          </td></tr>
          <tr><td style="padding-top:22px;font-size:13px;color:#8593b5">${t.expiry}</td></tr>
          <tr><td style="padding-top:6px;font-size:13px;color:#8593b5">${t.ignore}</td></tr>
          <tr><td style="padding-top:22px;font-size:12px;color:#5f6c8c;word-break:break-all" dir="ltr">${link}</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject: t.subject, html, text };
}
