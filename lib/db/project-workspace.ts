import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "./index";
import { payments, projectAgreements, projectDecisions } from "./schema";
import { assertCanViewProject } from "./access";
export async function projectWorkspace(projectId: string) {
  await assertCanViewProject(projectId);
  const [[agreement], decisions, [payment]] = await Promise.all([db.select().from(projectAgreements).where(eq(projectAgreements.projectId, projectId)).limit(1), db.select().from(projectDecisions).where(eq(projectDecisions.projectId, projectId)).orderBy(desc(projectDecisions.createdAt)).limit(50), db.select({ id: payments.id }).from(payments).where(and(eq(payments.projectId, projectId), inArray(payments.status, ["pending", "paid"]))).limit(1)]);
  return { agreement: agreement?.agreement ?? null, hasPayment: Boolean(payment), decisions: decisions.map(row => ({ id: row.id, title: row.title, detail: row.detail, priceCents: row.priceCents, extraDays: row.extraDays, state: row.state, response: row.response, createdAt: row.createdAt.toISOString() })) };
}
