import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db";
import { projectFiles, projects } from "@/lib/db/schema";
import { requireRole } from "@/lib/db/access";
export const portfolioMediaName = "Portfolio: published media";
export async function portfolioEntries(admin = false) {
 if (admin) await requireRole("super_admin", "admin", "pm");
 if (!isDatabaseConfigured) return [];
 // Explicit projection: never serialize client IDs, budgets, messages or dates.
 const rows = await db.select({ id: projects.id, name: projects.name, summary: projects.summary, cover: projects.cover, industry: projects.industry, stage: projects.stage, progress: projects.progress, visibility: projects.visibility, features: projects.tech }).from(projects).where(admin ? undefined : eq(projects.visibility, "public")).orderBy(desc(projects.updatedAt));
 if (!rows.length) return [];
 const media = await db.select({ projectId: projectFiles.projectId, kind: projectFiles.kind, url: projectFiles.url }).from(projectFiles).where(and(inArray(projectFiles.projectId, rows.map(p => p.id)), eq(projectFiles.name, portfolioMediaName), eq(projectFiles.visibleToClient, true)));
 return rows.map(row => ({ ...row, images: media.filter(m => m.projectId === row.id && m.kind === "image").map(m => m.url), url: media.find(m => m.projectId === row.id && m.kind === "demo")?.url ?? "" }));
}
export type PortfolioEntry = Awaited<ReturnType<typeof portfolioEntries>>[number];
