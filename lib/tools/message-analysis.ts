/** Passive local analysis. Never executes HTML, follows links, or stores message content. */
export type MessageFinding = {
  code: "insecure_link" | "embedded_credentials" | "ip_address" | "international_domain" | "hidden_destination" | "urgent_language" | "secret_request";
  severity: "warning" | "high";
};
export function analyzeMessageText(input: string) {
  if (new TextEncoder().encode(input).byteLength > 32_000) throw new Error("INPUT_TOO_LARGE");
  const findings = new Map<MessageFinding["code"], MessageFinding>();
  const add = (code: MessageFinding["code"], severity: MessageFinding["severity"]) => findings.set(code, { code, severity });
  const links = new Set<string>();
  for (const match of input.matchAll(/https?:\/\/[^\s<>"']+/gi)) {
    try {
      const url = new URL(match[0].replace(/[),.;!?]+$/, ""));
      if (url.protocol === "http:") add("insecure_link", "warning");
      if (url.username || url.password) add("embedded_credentials", "high");
      if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(url.hostname) || url.hostname.startsWith("[")) add("ip_address", "warning");
      if (url.hostname.includes("xn--")) add("international_domain", "warning");
      // Return origins only: paths and query strings can contain reset tokens or personal data.
      links.add(url.origin);
    } catch { /* Invalid link text is not fetched. */ }
  }
  for (const match of input.matchAll(/<a\b[^>]*href\s*=\s*["'](https?:\/\/[^"']+)["'][^>]*>\s*(https?:\/\/[^<\s]+)\s*<\/a>/gi)) {
    try {
      if (new URL(match[1]).hostname !== new URL(match[2]).hostname) add("hidden_destination", "high");
    } catch { /* Malformed markup remains plain text. */ }
  }
  if (/urgent|immediately|account.{0,20}(suspend|clos)|عاجل|فور[ًاا]|إغلاق حساب|تعليق حساب/i.test(input)) add("urgent_language", "warning");
  if (/(send|share|reply|provide).{0,60}(password|verification code|one.time code|otp)|(أرسل|ارسل|شارك|زو[ّ]?د).{0,60}(كلمة المرور|رمز التحقق|رمز الدخول)/i.test(input)) add("secret_request", "high");
  return {
    findings: [...findings.values()],
    linkOrigins: [...links].slice(0, 50),
    status: findings.size ? "indicators_found" as const : "no_indicators_found" as const,
    checked: ["visible_link_structure", "html_link_destination", "common_social_engineering_patterns"],
    notChecked: ["sender_identity", "spf_dkim_authentication", "attachments", "link_reputation", "destination_content", "mailbox_existence"],
  };
}
