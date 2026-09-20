/**
 * Authorisation layer.
 *
 * Neon has no row-level security tied to a session, so every read and write
 * goes through these guards instead. They mirror what the old Supabase RLS
 * policies enforced in the database.
 */
import { and, eq, or, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectMembers, projects } from "@/lib/db/schema";
import type { AppRole } from "@/lib/db/schema";

export class AuthorisationError extends Error {
  constructor(message = "Not authorised") {
    super(message);
    this.name = "AuthorisationError";
  }
}

export interface Viewer {
  id: string;
  email: string;
  name: string | null;
  role: AppRole;
}

/** Returns the signed-in user, or null for anonymous visitors. */
export async function getViewer(): Promise<Viewer | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    role: session.user.role,
  };
}

/** Same as `getViewer` but throws — use inside server actions. */
export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) throw new AuthorisationError("You must be signed in.");
  return viewer;
}

export async function requireRole(...allowed: AppRole[]): Promise<Viewer> {
  const viewer = await requireViewer();
  if (!allowed.includes(viewer.role)) {
    throw new AuthorisationError("Your role does not allow this action.");
  }
  return viewer;
}

export const STAFF_ROLES: AppRole[] = ["super_admin", "admin", "pm", "employee"];
export const isStaff = (role: AppRole) => STAFF_ROLES.includes(role);
export const isManager = (role: AppRole) =>
  role === "super_admin" || role === "admin" || role === "pm";

/**
 * Drizzle predicate restricting a `projects` query to what the viewer may see:
 * staff see everything, clients see only their own projects, anonymous
 * visitors see only public ones.
 */
export function visibleProjectsFilter(viewer: Viewer | null) {
  if (!viewer) return eq(projects.visibility, "public");
  if (isStaff(viewer.role)) return sql`true`;
  return or(
    eq(projects.visibility, "public"),
    eq(projects.clientId, viewer.id),
    sql`exists (select 1 from ${projectMembers} pm where pm.project_id = ${projects.id} and pm.user_id = ${viewer.id})`,
  );
}

/** Throws unless the viewer may read this specific project. */
export async function assertCanViewProject(projectId: string): Promise<Viewer | null> {
  const viewer = await getViewer();
  const [row] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), visibleProjectsFilter(viewer)))
    .limit(1);
  if (!row) throw new AuthorisationError("Project not found or not visible to you.");
  return viewer;
}

/** Only managers, or an employee assigned to the project, may write. */
export async function assertCanEditProject(projectId: string): Promise<Viewer> {
  const viewer = await requireViewer();
  if (isManager(viewer.role)) return viewer;
  if (viewer.role === "employee") {
    const [member] = await db
      .select({ userId: projectMembers.userId })
      .from(projectMembers)
      .where(
        and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, viewer.id)),
      )
      .limit(1);
    if (member) return viewer;
  }
  throw new AuthorisationError("You cannot modify this project.");
}
