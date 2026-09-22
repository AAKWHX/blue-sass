import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const RESET_TTL = 15 * 60 * 1000;
export const RESET_MAX_ATTEMPTS = 5;
export function newResetCode() { return randomInt(0, 100000000).toString().padStart(8, "0"); }
export function resetDigest(email: string, code: string, secret: string) {
  return createHmac("sha256", secret).update(`password-reset:${email}:${code}`).digest("hex");
}
export function matchesResetCode(email: string, code: string, digest: string, secret: string) {
  if (!/^\d{8}$/.test(code) || !/^[a-f0-9]{64}$/.test(digest)) return false;
  return timingSafeEqual(Buffer.from(resetDigest(email, code, secret), "hex"), Buffer.from(digest, "hex"));
}
