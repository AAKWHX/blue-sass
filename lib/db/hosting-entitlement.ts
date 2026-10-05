import "server-only";
import { and, eq, gte } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db";
import { payments, projects } from "@/lib/db/schema";
import { lifecycleState } from "@/lib/db/project-lifecycle";

/** Sandbox payments never authorize resource-consuming customer hosting. */
export async function hasHostingSubscription(userId: string) {
  if (!isDatabaseConfigured) return false;
  const cutoff = new Date(Date.now() - 30 * 86_400_000);
  const paid = await db.select({ id: projects.id }).from(projects).innerJoin(payments, eq(payments.projectId, projects.id)).where(and(eq(projects.clientId, userId), eq(projects.industry, "subscription"), eq(payments.userId, userId), eq(payments.environment, "live"), eq(payments.status, "paid"), gte(payments.paidAt, cutoff)));
  for (const project of paid) if (!(await lifecycleState(project.id)).cancelled) return true;
  return false;
}
