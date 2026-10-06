import type { JWT } from "next-auth/jwt";

/** Cookies carry small identity fields only; profile images stay in the database. */
export function compactSessionToken(token: JWT): JWT {
  const text = (value: unknown, limit: number) => typeof value === "string" ? value.slice(0, limit) : undefined;
  return {
    sub: text(token.sub, 128),
    uid: text(token.uid, 128),
    name: text(token.name, 80),
    email: text(token.email, 254),
    company: text(token.company, 120) ?? null,
    role: text(token.role, 32),
    locale: text(token.locale, 8),
    credentialRevision: text(token.credentialRevision, 64),
    canAdmin: token.canAdmin === true,
  };
}
