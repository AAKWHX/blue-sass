import { withExtraLocales } from "@/lib/i18n/extra-locales";
/**
 * Email bodies. All copy comes from the locale dictionaries so the seven
 * supported languages stay in one place.
 */
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]!);
}

function shell(lang: Locale, siteUrl: string, heading: string, body: string, action?: { label: string; url: string }) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const actionHtml = action ? `<tr><td style="padding-top:24px"><a href="${escapeHtml(action.url)}" style="display:inline-block;background:#fff;color:#050608;font-weight:800;font-size:15px;text-decoration:none;padding:13px 26px;border-radius:10px">${escapeHtml(action.label)}</a></td></tr>` : "";
  return `<!doctype html><html lang="${lang}" dir="${dir}"><body style="margin:0;padding:32px 16px;background:#050608;font-family:Arial,'Segoe UI',sans-serif;color:#fff"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table role="presentation" width="100%" style="max-width:600px;background:#101216;border:1px solid #232630;border-radius:20px;padding:32px" cellpadding="0" cellspacing="0" dir="${dir}"><tr><td><a href="${escapeHtml(siteUrl)}" style="display:inline-flex;align-items:center;text-decoration:none;color:#fff;font-size:17px;font-weight:800"><img src="${escapeHtml(siteUrl)}/icon.png" width="42" height="42" alt="Blue Sass" style="border-radius:12px;vertical-align:middle;margin-inline-end:10px"> Blue Sass</a></td></tr><tr><td style="padding-top:22px;font-size:26px;line-height:1.35;font-weight:800">${escapeHtml(heading)}</td></tr><tr><td style="padding-top:14px;font-size:15px;line-height:1.85;color:#b9c0c9">${body}</td></tr>${actionHtml}<tr><td style="padding-top:28px;border-top:1px solid #232630;font-size:12px;line-height:1.7;color:#747d88">Blue Sass · Websites · Apps · Digital systems<br><a href="mailto:help@bluesass.nl" style="color:#dfe5ec">help@bluesass.nl</a></td></tr></table></td></tr></table></body></html>`;
}

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
          <tr><td style="font-size:15px;color:#5eead4;font-weight:700">Blue Sass</td></tr>
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

const transactionalCopy = withExtraLocales({
  ar: { recoverySubject: "رمز استعادة حساب Blue Sass", recoveryHeading: "استعادة الوصول إلى حسابك", recoveryIntro: "استخدم الرمز الآمن أدناه لإعادة تعيين كلمة المرور. لا تشاركه مع أي شخص من فريق الدعم.", recoveryExpiry: "تنتهي صلاحية الرمز خلال 15 دقيقة. إن لم تطلبه فتجاهل الرسالة.", purchaseSubject: "تأكيد عملية الشراء من Blue Sass", purchaseHeading: "تم استلام دفعتك بنجاح", purchaseIntro: "أكد PayPal اكتمال العملية. بدأنا الآن تجهيز المشروع داخل لوحة العميل.", project: "المشروع أو الخدمة", amount: "المبلغ", reference: "مرجع الدفع", date: "تاريخ الدفع", next: "يمكنك متابعة التخطيط والملفات والقرارات من لوحة مشاريعك.", portal: "فتح لوحة المشاريع" },
  en: { recoverySubject: "Blue Sass account recovery code", recoveryHeading: "Restore access to your account", recoveryIntro: "Use the secure code below to reset your password. Never share it with support staff.", recoveryExpiry: "The code expires in 15 minutes. Ignore this email if you did not request it.", purchaseSubject: "Your Blue Sass purchase confirmation", purchaseHeading: "Your payment was received", purchaseIntro: "PayPal confirmed that the transaction completed. We are now preparing the project in your client workspace.", project: "Project or service", amount: "Amount", reference: "Payment reference", date: "Payment date", next: "Track planning, files and decisions from your project workspace.", portal: "Open project workspace" },
  nl: { recoverySubject: "Herstelcode voor Blue Sass", recoveryHeading: "Herstel toegang tot uw account", recoveryIntro: "Gebruik de veilige code hieronder om uw wachtwoord opnieuw in te stellen.", recoveryExpiry: "De code verloopt over 15 minuten. Negeer dit bericht als u dit niet hebt aangevraagd.", purchaseSubject: "Bevestiging van uw Blue Sass-aankoop", purchaseHeading: "Uw betaling is ontvangen", purchaseIntro: "PayPal heeft de betaling bevestigd. We bereiden uw project nu voor.", project: "Project of dienst", amount: "Bedrag", reference: "Betalingsreferentie", date: "Betaaldatum", next: "Volg planning, bestanden en besluiten in uw projectomgeving.", portal: "Projectomgeving openen" },
  de: { recoverySubject: "Blue Sass Wiederherstellungscode", recoveryHeading: "Kontozugang wiederherstellen", recoveryIntro: "Verwenden Sie den sicheren Code unten, um Ihr Passwort zurückzusetzen.", recoveryExpiry: "Der Code läuft in 15 Minuten ab. Ignorieren Sie diese E-Mail, wenn Sie ihn nicht angefordert haben.", purchaseSubject: "Bestätigung Ihres Blue Sass-Kaufs", purchaseHeading: "Ihre Zahlung ist eingegangen", purchaseIntro: "PayPal hat die Zahlung bestätigt. Ihr Projekt wird jetzt vorbereitet.", project: "Projekt oder Dienst", amount: "Betrag", reference: "Zahlungsreferenz", date: "Zahlungsdatum", next: "Verfolgen Sie Planung, Dateien und Entscheidungen im Projektbereich.", portal: "Projektbereich öffnen" },
  tr: { recoverySubject: "Blue Sass hesap kurtarma kodu", recoveryHeading: "Hesabınıza erişimi geri yükleyin", recoveryIntro: "Şifrenizi sıfırlamak için aşağıdaki güvenli kodu kullanın.", recoveryExpiry: "Kod 15 dakika içinde sona erer. Siz istemediyseniz bu e-postayı yok sayın.", purchaseSubject: "Blue Sass satın alma onayı", purchaseHeading: "Ödemeniz alındı", purchaseIntro: "PayPal işlemi onayladı. Projenizi hazırlıyoruz.", project: "Proje veya hizmet", amount: "Tutar", reference: "Ödeme referansı", date: "Ödeme tarihi", next: "Planlama ve dosyaları proje alanından takip edin.", portal: "Proje alanını aç" },
  fr: { recoverySubject: "Code de récupération Blue Sass", recoveryHeading: "Récupérez l’accès à votre compte", recoveryIntro: "Utilisez le code sécurisé ci-dessous pour réinitialiser votre mot de passe.", recoveryExpiry: "Le code expire dans 15 minutes. Ignorez cet e-mail si vous ne l’avez pas demandé.", purchaseSubject: "Confirmation de votre achat Blue Sass", purchaseHeading: "Votre paiement a été reçu", purchaseIntro: "PayPal a confirmé la transaction. Nous préparons maintenant votre projet.", project: "Projet ou service", amount: "Montant", reference: "Référence", date: "Date du paiement", next: "Suivez la planification et les fichiers depuis votre espace projet.", portal: "Ouvrir l’espace projet" },
  es: { recoverySubject: "Código de recuperación de Blue Sass", recoveryHeading: "Recupere el acceso a su cuenta", recoveryIntro: "Use el código seguro para restablecer su contraseña.", recoveryExpiry: "El código caduca en 15 minutos. Ignore este correo si no lo solicitó.", purchaseSubject: "Confirmación de compra de Blue Sass", purchaseHeading: "Hemos recibido su pago", purchaseIntro: "PayPal confirmó la transacción. Ya estamos preparando su proyecto.", project: "Proyecto o servicio", amount: "Importe", reference: "Referencia", date: "Fecha de pago", next: "Siga la planificación y los archivos desde su área de proyecto.", portal: "Abrir área de proyecto" },
} as const);

export function recoveryEmail(locale: string, code: string, siteUrl: string) {
  const lang: Locale = isLocale(locale) ? locale : "en";
  const c = transactionalCopy[lang];
  const body = `<p style="margin:0">${escapeHtml(c.recoveryIntro)}</p><div dir="ltr" style="margin:24px 0;padding:18px;border:1px solid #343842;border-radius:14px;background:#08090c;text-align:center;font-size:32px;font-weight:800;letter-spacing:8px;color:#fff">${escapeHtml(code)}</div><p style="margin:0">${escapeHtml(c.recoveryExpiry)}</p>`;
  return { subject: c.recoverySubject, html: shell(lang, siteUrl, c.recoveryHeading, body), text: `${c.recoveryHeading}\n\n${c.recoveryIntro}\n\n${code}\n\n${c.recoveryExpiry}` };
}

export function purchaseConfirmationEmail(locale: string, details: { projectName: string; amount: string; reference: string; paidAt: Date; portalUrl: string; siteUrl: string }) {
  const lang: Locale = isLocale(locale) ? locale : "en";
  const c = transactionalCopy[lang];
  const rows = [[c.project, details.projectName], [c.amount, details.amount], [c.reference, details.reference], [c.date, new Intl.DateTimeFormat(lang, { dateStyle: "long", timeStyle: "short" }).format(details.paidAt)]];
  const body = `<p style="margin:0 0 18px">${escapeHtml(c.purchaseIntro)}</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rows.map(([label,value]) => `<tr><td style="padding:10px 0;border-bottom:1px solid #232630;color:#87909b">${escapeHtml(label)}</td><td dir="auto" style="padding:10px 0;border-bottom:1px solid #232630;text-align:${lang === "ar" ? "left" : "right"};font-weight:700;color:#fff">${escapeHtml(value)}</td></tr>`).join("")}</table><p style="margin:18px 0 0">${escapeHtml(c.next)}</p>`;
  return { subject: c.purchaseSubject, html: shell(lang, details.siteUrl, c.purchaseHeading, body, { label: c.portal, url: details.portalUrl }), text: `${c.purchaseHeading}\n\n${c.purchaseIntro}\n${rows.map(([a,b]) => `${a}: ${b}`).join("\n")}\n\n${c.next}\n${details.portalUrl}` };
}

export function marketingEmail(locale: string, details: { title: string; message: string; ctaLabel: string; ctaUrl: string; siteUrl: string }) {
  const lang: Locale = isLocale(locale) ? locale : "en";
  const optOut = lang === "ar" ? "يمكنك إيقاف رسائل العروض من إعدادات ملفك الشخصي." : "You can opt out of marketing emails in your profile settings.";
  const body = `<p style="margin:0">${escapeHtml(details.message).replace(/\n/g, "<br>")}</p><p style="margin:20px 0 0;font-size:12px;color:#747d88">${escapeHtml(optOut)}</p>`;
  return { subject: details.title, html: shell(lang, details.siteUrl, details.title, body, { label: details.ctaLabel, url: details.ctaUrl }), text: `${details.title}\n\n${details.message}\n\n${details.ctaUrl}\n\n${optOut}` };
}
