import { createHash } from "node:crypto";
export const validShareToken = (token: string) => /^[a-f0-9]{64}$/.test(token);
export const shareTokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
export const shareExpiresAt = (now = new Date()) => new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
