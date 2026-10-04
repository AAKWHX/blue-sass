import "server-only";
import { and, eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db";
import { projectRequests, projects } from "@/lib/db/schema";
import { getViewer, visibleProjectsFilter } from "@/lib/db/access";

export async function getProjectRequest(projectId: string) {
  if (!isDatabaseConfigured) return null;
  const viewer = await getViewer();
  if (!viewer) return null;
  try {
    const [row] = await db.select({ request: projectRequests }).from(projectRequests)
      .innerJoin(projects, eq(projects.id, projectRequests.projectId))
      .where(and(eq(projects.id, projectId), visibleProjectsFilter(viewer))).limit(1);
    return row?.request ?? null;
  } catch (error) {
    // Legacy deployments stay readable during the additive table migration.
    if (error && typeof error === "object" && "code" in error && error.code === "42P01") return null;
    throw error;
  }
}
