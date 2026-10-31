export const qrModes = ["URL", "Text", "Email", "Phone", "WhatsApp", "Wi-Fi", "vCard"] as const;
export type QrMode = typeof qrModes[number];

/** Pure payload validation shared with the client QR renderer. Nothing is sent. */
export function qrPayload(mode: QrMode, value: string, password = "") {
  const text = value.trim();
  if (!qrModes.includes(mode) || !text || text.length > 1500 || password.length > 100) throw new Error("INVALID_QR_INPUT");
  if (mode === "URL") {
    const url = new URL(text);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("INVALID_QR_URL");
    return url.href;
  }
  if (mode === "Email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) throw new Error("INVALID_QR_EMAIL");
    return `mailto:${text}`;
  }
  if (mode === "Phone" || mode === "WhatsApp") {
    if (!/^\+?[\d ()-]{5,30}$/.test(text)) throw new Error("INVALID_QR_PHONE");
    const phone = text.replace(/[^\d+]/g, "");
    if (!/^\+?\d{5,15}$/.test(phone)) throw new Error("INVALID_QR_PHONE");
    return mode === "Phone" ? `tel:${phone}` : `https://wa.me/${phone.replace("+", "")}`;
  }
  if (mode === "Wi-Fi") {
    const escape = (s: string) => s.replace(/[\\;,:\"]/g, "\\$&");
    return `WIFI:T:${password ? "WPA" : "nopass"};S:${escape(text)};P:${escape(password)};;`;
  }
  if (mode === "vCard" && !/^BEGIN:VCARD\r?\n[\s\S]+\r?\nEND:VCARD$/i.test(text)) throw new Error("INVALID_QR_VCARD");
  return text;
}
