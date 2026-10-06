import "server-only";
import { createHash } from "node:crypto";
export function credentialRevision(passwordHash: string | null, accessVersion = 0) {
  const value = passwordHash ?? "oauth-only";
  // Preserve existing valid sessions at version zero, but permanently revoke
  // older sessions after a suspension or restoration.
  return createHash("sha256").update(accessVersion === 0 ? value : `${value}:${accessVersion}`).digest("hex");
}
