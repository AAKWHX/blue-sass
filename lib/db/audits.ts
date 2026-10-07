import "server-only";
import { and, desc, eq, gte, lt, ne, sql } from "drizzle-orm";
import { db, isDatabaseConfigured } from "./index";
import { payments, projects, siteAudits, subscriptionOrders, users, platformOwner, toolUsage } from "./schema";
import { requireViewer } from "./access";
import { lifecycleState } from "./project-lifecycle";
import type { AuditReport } from "../audits/types";
import { auditTargetKey } from "../audits/target-key";

export async function toolEntitlement(userId: string) {
  const month = new Date(); month.setUTCDate(1); month.setUTCHours(0, 0, 0, 0);
  const free = { plan: "free", reports: 1, sites: 1, compare: false, jsonExport: false, startsAt: month, endsAt: new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1)) };
  if (!userId || !isDatabaseConfigured) return free;
  const [owner] = await db.select({ id: platformOwner.userId }).from(platformOwner).where(and(eq(platformOwner.slot, 1), eq(platformOwner.userId, userId))).limit(1);
  if (owner) return { ...free, plan: "owner", reports: 100, sites: 30, compare: true, jsonExport: true };
  const rows = await db.select({ snapshot: subscriptionOrders.snapshot, plan: subscriptionOrders.planId, paidAt: payments.paidAt, projectId: projects.id }).from(subscriptionOrders)
    .innerJoin(projects, eq(projects.id, subscriptionOrders.projectId)).innerJoin(payments, eq(payments.projectId, projects.id))
    .where(and(eq(projects.clientId, userId), eq(payments.userId, userId), eq(payments.environment, "live"), eq(payments.status, "paid"), gte(payments.paidAt, new Date(Date.now() - 30 * 86_400_000))))
    .orderBy(desc(payments.paidAt)).limit(20);
  let result = free;
  for (const row of rows) {
    if (!row.paidAt || (await lifecycleState(row.projectId)).cancelled) continue;
    const endsAt = new Date(row.paidAt.getTime() + row.snapshot.durationDays * 86_400_000);
    if (endsAt <= new Date() || row.snapshot.reports <= result.reports) continue;
    result = { plan: row.plan, reports: row.snapshot.reports, sites: row.snapshot.sites, compare: row.snapshot.compare, jsonExport: row.snapshot.jsonExport, startsAt: row.paidAt, endsAt };
  }
  return result;
}
export async function reserveAudit(userId: string, source: "url" | "files", target: string) {
  const entitlement = await toolEntitlement(userId);
  return db.transaction(async tx => {
    // Serialise quota claims only; network and file analysis run after commit.
    await tx.execute(sql`select id from ${users} where id = ${userId} for update`);
    const day = new Date(); day.setUTCHours(0, 0, 0, 0);
    const [attempts] = await tx.select({ count: sql<number>`count(*)::integer` }).from(siteAudits).where(and(eq(siteAudits.userId, userId), gte(siteAudits.createdAt, day)));
    if (attempts.count >= Math.min(200, Math.max(40, entitlement.reports))) throw new Error("AUDIT_BUSY");
    await tx.update(siteAudits).set({ status: "failed" }).where(and(eq(siteAudits.userId, userId), eq(siteAudits.status, "pending"), lt(siteAudits.createdAt, new Date(Date.now() - 120_000))));
    await tx.update(toolUsage).set({ status: "failed" }).where(and(eq(toolUsage.userId,userId),eq(toolUsage.status,"pending"),lt(toolUsage.createdAt,new Date(Date.now()-300_000))));
    const rows = await tx.select({ source: siteAudits.source, target: siteAudits.target, status: siteAudits.status }).from(siteAudits).where(and(eq(siteAudits.userId, userId), ne(siteAudits.status, "failed"), gte(siteAudits.createdAt, entitlement.startsAt)));
    if (rows.some(row => row.status === "pending")) throw new Error("AUDIT_BUSY");
    const [ai] = await tx.select({ used: sql<number>`coalesce(sum(credits),0)::integer` }).from(toolUsage).where(and(eq(toolUsage.userId,userId),gte(toolUsage.createdAt,entitlement.startsAt),ne(toolUsage.status,"failed")));
    if (rows.length + ai.used >= entitlement.reports) throw new Error("AUDIT_QUOTA");
    const targets = new Set(rows.map(row => auditTargetKey(row.source, row.target)));
    if (!targets.has(auditTargetKey(source, target)) && targets.size >= entitlement.sites) throw new Error("SITE_QUOTA");
    const [row] = await tx.insert(siteAudits).values({ userId, source, target }).returning({ id: siteAudits.id });
    return row.id;
  });
}
export async function finishAudit(id: string, userId: string, report: AuditReport | null) {
  await db.update(siteAudits).set({ status: report ? "completed" : "failed", report }).where(and(eq(siteAudits.id, id), eq(siteAudits.userId, userId), eq(siteAudits.status, "pending")));
}
export async function ownedReports() {
  const viewer = await requireViewer();
  const [reports, entitlement] = await Promise.all([
    db.select({ id: siteAudits.id, source: siteAudits.source, target: siteAudits.target, status: siteAudits.status, createdAt: siteAudits.createdAt }).from(siteAudits).where(eq(siteAudits.userId, viewer.id)).orderBy(desc(siteAudits.createdAt)).limit(120),
    toolEntitlement(viewer.id),
  ]);
  return { reports, entitlement };
}
export async function ownedReport(id: string) {
  const viewer = await requireViewer();
  const [row] = await db.select().from(siteAudits).where(and(eq(siteAudits.id, id), eq(siteAudits.userId, viewer.id))).limit(1);
  return row ?? null;
}
