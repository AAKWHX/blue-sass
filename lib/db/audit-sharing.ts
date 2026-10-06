import "server-only";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db";
import { siteAudits, users } from "@/lib/db/schema";
import { validShareToken, shareTokenHash } from "@/lib/audits/sharing";
export async function sharedAudit(token: string) {
  if (!isDatabaseConfigured || !validShareToken(token)) return null;
  const [row] = await db.select({ id: siteAudits.id, report: siteAudits.report }).from(siteAudits).innerJoin(users, eq(users.id, siteAudits.userId)).where(and(eq(siteAudits.shareTokenHash, shareTokenHash(token)), gt(siteAudits.shareExpiresAt, new Date()), eq(siteAudits.status,"completed"), isNull(users.disabledAt))).limit(1);
  return row?.report ? row : null;
}
