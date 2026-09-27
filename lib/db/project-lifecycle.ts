import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db";
import { projectFiles, projects } from "@/lib/db/schema";

// Internal audit documents live in the existing document store. Never expose
// them as downloadable files or accept these URNs in media-upload actions.
export const lifecycleUrls = { locked: "urn:bluesass:lifecycle:design-started", cancelled: "urn:bluesass:lifecycle:cancelled" } as const;
export type ProjectTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export async function lifecycleState(projectId: string, tx: ProjectTransaction | typeof db = db) {
 if (!isDatabaseConfigured) return { cancelled: false, locked: false };
 const records = await tx.select({ url: projectFiles.url }).from(projectFiles).where(and(eq(projectFiles.projectId, projectId), inArray(projectFiles.url, Object.values(lifecycleUrls))));
 return { cancelled: records.some(r => r.url === lifecycleUrls.cancelled), locked: records.some(r => r.url === lifecycleUrls.locked) };
}
export async function recordLifecycle(tx: ProjectTransaction, projectId: string, event: keyof typeof lifecycleUrls, actorId: string) {
 await tx.insert(projectFiles).values({ projectId, name: `System audit: ${event}`, category: "document", kind: "document", url: lifecycleUrls[event], visibleToClient: false, uploadedBy: actorId });
}
export async function lockProject(tx: ProjectTransaction, id: string) {
 const [project] = await tx.select().from(projects).where(eq(projects.id, id)).for("update");
 return project;
}
