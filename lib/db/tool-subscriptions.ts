import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "./index";
import { subscriptionOrders, projects } from "./schema";
import { requireViewer } from "./access";
export async function toolOrderIds(projectIds: string[]) {
  if (!projectIds.length) return new Set<string>();
  const rows = await db.select({ id: subscriptionOrders.projectId }).from(subscriptionOrders).where(inArray(subscriptionOrders.projectId, projectIds));
  return new Set(rows.map(row => row.id));
}
export async function ownToolOrder(projectId: string) {
  const viewer = await requireViewer();
  const [row] = await db.select({ order: subscriptionOrders, project: projects }).from(subscriptionOrders).innerJoin(projects, eq(projects.id, subscriptionOrders.projectId)).where(and(eq(projects.id, projectId), eq(projects.clientId, viewer.id))).limit(1);
  return row ?? null;
}
export async function ownToolOrders() {
  const viewer = await requireViewer();
  return db.select({ id: projects.id, name: projects.name, price: subscriptionOrders.snapshot, createdAt: subscriptionOrders.createdAt }).from(subscriptionOrders).innerJoin(projects, eq(projects.id, subscriptionOrders.projectId)).where(eq(projects.clientId, viewer.id)).limit(30);
}
