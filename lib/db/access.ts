/**
 * Authorisation layer.
 *
 * Auth.js sessions do not identify Supabase Data API users. Private tables
 * have RLS enabled and no client-role grants. The trusted SQL connection can
 * bypass RLS, so every server read and write must still use these guards.
 */
import "server-only";
import { and, eq, or, sql, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, isDatabaseConfigured } from "@/lib/db";
import { projectMembers, projects, users, platformOwner, staffAccess } from "@/lib/db/schema";
import type { AppRole } from "@/lib/db/schema";
import { capabilityKeys, hasCapability, type Capability } from "@/lib/capabilities";
import { cache } from "react";
export { hasCapability, canOpenAdmin } from "@/lib/capabilities";

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
  image: string | null;
  company: string | null;
  title: string | null;
  phone: string | null;
  locale: string;
  marketingOptIn: boolean;
  isOwner: boolean;
  permissions: string[];
}

/** Returns the signed-in user, or null for anonymous visitors. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (!isDatabaseConfigured) return null;
  const [record] = await db.select({
    id: users.id, email: users.email, name: users.name, role: users.role,
    image: users.image, company: users.company, title: users.title,
    phone: users.phone, locale: users.locale, marketingOptIn: users.marketingOptIn,
  }).from(users).where(and(eq(users.id, session.user.id), isNull(users.disabledAt))).limit(1);
  if (!record) return null;
  const [[owner], [access]] = await Promise.all([
    db.select({ userId: platformOwner.userId }).from(platformOwner).where(eq(platformOwner.slot, 1)).limit(1),
    db.select({ permissions: staffAccess.permissions }).from(staffAccess).where(eq(staffAccess.userId, record.id)).limit(1),
  ]);
  const readOnly = record.email.toLowerCase() === "al3rab@bluesass.nl";
  const granted = Array.isArray(access?.permissions) ? access.permissions.filter(value => typeof value === "string" && (capabilityKeys as readonly string[]).includes(value)) : [];
  return { ...record, isOwner: !readOnly && owner?.userId === record.id, permissions: readOnly ? granted.filter(value => ["leads.read", "projects.read_all", "projects.read_assigned"].includes(value)) : granted };
});

/** Same as `getViewer` but throws — use inside server actions. */
export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) throw new AuthorisationError("You must be signed in.");
  return viewer;
}

export async function requireRole(...allowed: AppRole[]): Promise<Viewer> {
  const viewer = await requireViewer();
  assertCanWrite(viewer);
  if (!viewer.isOwner || !allowed.includes(viewer.role)) {
    throw new AuthorisationError("Your role does not allow this action.");
  }
  return viewer;
}

export async function requirePermission(permission: Capability): Promise<Viewer> {
  const viewer = await requireViewer(); assertCanWrite(viewer);
  if (!hasCapability(viewer, permission)) throw new AuthorisationError();
  return viewer;
}
export async function requireOwner(): Promise<Viewer> {
  const viewer = await requireViewer(); assertCanWrite(viewer);
  if (!viewer.isOwner) throw new AuthorisationError();
  return viewer;
}

export const STAFF_ROLES: AppRole[] = ["super_admin", "admin", "pm", "employee"];
export const isStaff = (role: AppRole) => STAFF_ROLES.includes(role);
export const isReadOnlyAssistant = (viewer: Viewer) => viewer.email.toLowerCase() === "al3rab@bluesass.nl";
export function assertCanWrite(viewer: Viewer) {
  if (isReadOnlyAssistant(viewer)) throw new AuthorisationError("This account has read-only access.");
}
export const isManager = (role: AppRole) =>
  role === "super_admin" || role === "admin" || role === "pm";

/**
 * Drizzle predicate restricting a `projects` query to what the viewer may see:
 * staff see everything, clients see only their own projects, anonymous
 * visitors cannot access private project records.
 */
export function visibleProjectsFilter(viewer: Viewer | null) {
  if (!viewer) return sql`false`;
  if (hasCapability(viewer, "projects.read_all") || hasCapability(viewer, "projects.edit_all")) return sql`true`;
  if (!(hasCapability(viewer, "projects.read_assigned") || hasCapability(viewer, "projects.edit_assigned"))) return eq(projects.clientId, viewer.id);
  return or(
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
  assertCanWrite(viewer);
  if (hasCapability(viewer, "projects.edit_all")) return viewer;
  if (hasCapability(viewer, "projects.edit_assigned")) {
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
