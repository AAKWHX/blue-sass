import "server-only";
import { createHash } from "node:crypto";
import { readBoundedText } from "@/lib/request-body";

export function validPasswordLength(password: string, existing = false) {
  return password.length >= (existing ? 8 : 12) && password.length <= (existing ? 128 : 64) && Buffer.byteLength(password, "utf8") <= 72;
}
export type PasswordCheck = "ok" | "length" | "breached" | "unavailable";
/** Only a five-character hash prefix leaves the server; nothing is logged or saved. */
export async function checkNewPassword(password: string, request: typeof fetch = fetch): Promise<PasswordCheck> {
  if (!validPasswordLength(password)) return "length";
  const digest = createHash("sha1").update(password).digest("hex").toUpperCase();
  try {
    const response = await request(`https://api.pwnedpasswords.com/range/${digest.slice(0, 5)}`, {
      headers: { "Add-Padding": "true", "User-Agent": "BlueSass-Password-Security" },
      cache: "no-store", signal: AbortSignal.timeout(5000), redirect: "error",
    });
    if (!response.ok) return "unavailable";
    const body = await readBoundedText(response, 200_000);
    if (body.length > 200_000 || !body.trim()) return "unavailable";
    for (const line of body.trim().split(/\r?\n/)) {
      const match = /^([A-F0-9]{35}):(\d+)$/.exec(line);
      if (!match) return "unavailable";
      if (match[1] === digest.slice(5) && Number(match[2]) > 0) return "breached";
    }
    return "ok";
  } catch { return "unavailable"; }
}
