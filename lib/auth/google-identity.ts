export function verifiedGoogleEmail(profile: { email?: unknown; email_verified?: unknown } | undefined) {
  if (profile?.email_verified !== true || typeof profile.email !== "string") return null;
  const email = profile.email.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
export function mayRepairGoogleLink(target: { email: string; emailVerified: Date | null; passwordHash: string | null; disabledAt: Date | null } | undefined, verifiedEmail: string) {
  return Boolean(target && target.email.toLowerCase() === verifiedEmail && !target.disabledAt && (target.emailVerified || !target.passwordHash));
}
