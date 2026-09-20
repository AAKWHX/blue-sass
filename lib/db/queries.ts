/**
 * Read helpers used by server components.
 *
 * Every function degrades gracefully: with no DATABASE_URL it returns the
 * bundled mock data so the marketing site and dashboards still render.
 */
import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db";
import {
  feedback,
  leads,
  messages,
  projectFiles,
  projectMilestones,
  projects,
  users,
} from "@/lib/db/schema";
import type { Project } from "@/lib/db/schema";
import { getViewer, isStaff, visibleProjectsFilter } from "@/lib/db/access";
import * as mock from "@/lib/mock-data";

/** Public portfolio — only projects explicitly marked public. */
export async function listPublicProjects(): Promise<Project[]> {
  if (!isDatabaseConfigured) return mock.publicProjectsFallback();
  return db
    .select()
    .from(projects)
    .where(eq(projects.visibility, "public"))
    .orderBy(desc(projects.createdAt));
}

/** Projects the signed-in viewer may open. */
export async function listViewerProjects(): Promise<Project[]> {
  const viewer = await getViewer();
  if (!isDatabaseConfigured) return mock.viewerProjectsFallback(viewer?.role ?? "client");
  return db
    .select()
    .from(projects)
    .where(visibleProjectsFilter(viewer))
    .orderBy(desc(projects.updatedAt));
}

export interface ProjectDetail {
  project: Project;
  milestones: (typeof projectMilestones.$inferSelect)[];
  files: (typeof projectFiles.$inferSelect)[];
  feedback: (typeof feedback.$inferSelect)[];
  messages: (typeof messages.$inferSelect)[];
}

export async function getProjectDetail(projectId: string): Promise<ProjectDetail | null> {
  if (!isDatabaseConfigured) return mock.projectDetailFallback(projectId);

  const viewer = await getViewer();
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), visibleProjectsFilter(viewer)))
    .limit(1);
  if (!project) return null;

  const clientOnly = !viewer || !isStaff(viewer.role);

  const [ms, fs, fb, msgs] = await Promise.all([
    db
      .select()
      .from(projectMilestones)
      .where(eq(projectMilestones.projectId, projectId))
      .orderBy(asc(projectMilestones.orderIndex)),
    db
      .select()
      .from(projectFiles)
      .where(
        clientOnly
          ? and(
              eq(projectFiles.projectId, projectId),
              eq(projectFiles.visibleToClient, true),
            )
          : eq(projectFiles.projectId, projectId),
      )
      .orderBy(desc(projectFiles.createdAt)),
    db
      .select()
      .from(feedback)
      .where(eq(feedback.projectId, projectId))
      .orderBy(desc(feedback.createdAt)),
    db
      .select()
      .from(messages)
      .where(eq(messages.projectId, projectId))
      .orderBy(asc(messages.createdAt)),
  ]);

  return { project, milestones: ms, files: fs, feedback: fb, messages: msgs };
}

/** Admin: every lead captured by the public quote form. */
export async function listLeads() {
  if (!isDatabaseConfigured) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt));
}

/** Admin: the client directory. */
export async function listUsers() {
  if (!isDatabaseConfigured) return [];
  return db.select().from(users).orderBy(asc(users.name));
}

/**
 * Client-facing progress summary: percentage complete plus the estimated
 * remaining time derived from unfinished milestones.
 */
export function summariseProgress(detail: ProjectDetail) {
  const total = detail.milestones.length;
  const done = detail.milestones.filter((m) => m.status === "done").length;
  const percent = total === 0 ? detail.project.progress : Math.round((done / total) * 100);
  const remainingHours = detail.milestones
    .filter((m) => m.status !== "done")
    .reduce((sum, m) => sum + m.estimatedHours, 0);
  const deadline = detail.project.deadline;
  const daysLeft = deadline
    ? Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86_400_000))
    : null;
  return { total, done, percent, remainingHours, daysLeft };
}
