import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { accounts, users, adminAudit } from "@/lib/db/schema";
import { mayRepairGoogleLink } from "@/lib/auth/google-identity";

/** Repair only a Google identity proven by the OAuth callback, without moving roles or projects. */
export async function validateGoogleAccountLink(providerAccountId: string, email: string) {
  return db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`google:${providerAccountId}`}, 0))`);
    const [linked] = await tx.select({ userId: accounts.userId, email: users.email, disabledAt: users.disabledAt }).from(accounts).innerJoin(users, eq(users.id, accounts.userId)).where(and(eq(accounts.provider, "google"), eq(accounts.providerAccountId, providerAccountId))).limit(1);
    if (!linked) return true;
    if (linked.email.toLowerCase() === email) return !linked.disabledAt;
    const [target] = await tx.select({ id: users.id, email: users.email, emailVerified: users.emailVerified, passwordHash: users.passwordHash, disabledAt: users.disabledAt }).from(users).where(eq(users.email, email)).limit(1);
    if (!mayRepairGoogleLink(target, email) || !target) return false;
    // Revoke sessions minted under the mismatched identity before correcting its link.
    await tx.update(users).set({ accessVersion: sql`${users.accessVersion} + 1` }).where(eq(users.id, linked.userId));
    await tx.update(accounts).set({ userId: target.id }).where(and(eq(accounts.provider, "google"), eq(accounts.providerAccountId, providerAccountId), eq(accounts.userId, linked.userId)));
    await tx.insert(adminAudit).values({ actorId: target.id, targetId: linked.userId, action: "auth.identity_link_corrected", details: { provider: "google" } });
    return true;
  });
}
