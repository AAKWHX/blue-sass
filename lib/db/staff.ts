import "server-only";
import { desc, eq, ilike, or, and, isNull, sql } from "drizzle-orm";
import { db } from "./index";
import { users, staffAccess, staffInvitations, adminAudit, projects, projectMembers } from "./schema";
import { requireOwner, requirePermission, visibleProjectsFilter } from "./access";
export async function staffDirectory(query = "", page = 0) {
  const owner = await requireOwner();
  const term = query.slice(0, 120).replace(/[\\%_]/g, "");
  const [accounts, invitations, events] = await Promise.all([
    db.select({ id: users.id, name: users.name, email: users.email, role: users.role, disabledAt: users.disabledAt, permissions: staffAccess.permissions }).from(users).leftJoin(staffAccess, eq(users.id, staffAccess.userId)).where(term ? or(ilike(users.name, `%${term}%`), ilike(users.email, `%${term}%`)) : undefined).orderBy(desc(users.createdAt)).limit(50).offset(Math.min(Math.max(page, 0), 1000) * 50),
    db.select({ id: staffInvitations.id, email: staffInvitations.email, expiresAt: staffInvitations.expiresAt, acceptedAt: staffInvitations.acceptedAt, revokedAt: staffInvitations.revokedAt }).from(staffInvitations).orderBy(desc(staffInvitations.createdAt)).limit(30),
    db.select({ id: adminAudit.id, actor: users.name, actorEmail: users.email, action: adminAudit.action, targetId: adminAudit.targetId, details: adminAudit.details, createdAt: adminAudit.createdAt }).from(adminAudit).innerJoin(users, eq(users.id, adminAudit.actorId)).orderBy(desc(adminAudit.createdAt)).limit(100),
  ]);
  return { ownerId: owner.id, accounts: accounts.map(user => ({ id: user.id, name: user.name, email: user.email, role: user.role, disabled: Boolean(user.disabledAt), permissions: user.permissions ?? [], readOnly: user.email.toLowerCase() === "al3rab@bluesass.nl" })), invitations: invitations.map(invite => ({ id: invite.id, email: invite.email, expires: invite.expiresAt.toISOString().slice(0, 10), active: !invite.acceptedAt && !invite.revokedAt && invite.expiresAt > new Date() })), events: events.map(event => ({ ...event, createdAt: event.createdAt.toISOString() })) };
}
export async function assignmentDirectory() {
  const viewer = await requirePermission("projects.assign");
  const [staff, availableProjects, assignments] = await Promise.all([
    db.select({ id: users.id, name: users.name }).from(users).innerJoin(staffAccess, eq(users.id, staffAccess.userId)).where(and(isNull(users.disabledAt), sql`${staffAccess.permissions} ?| array['projects.read_assigned','projects.edit_assigned','projects.read_all','projects.edit_all']`)).limit(200),
    // Project visibility is revalidated inside the mutation as well.
    import("./queries").then(module => module.listViewerProjects()),
    db.select({ projectId: projectMembers.projectId, userId: projectMembers.userId, name: users.name }).from(projectMembers).innerJoin(projects, eq(projects.id, projectMembers.projectId)).innerJoin(users, eq(users.id, projectMembers.userId)).where(and(eq(projectMembers.role, "employee"), visibleProjectsFilter(viewer))).limit(200),
  ]);
  return { staff: viewer.isOwner ? [{ id: viewer.id, name: viewer.name }, ...staff.filter(user => user.id !== viewer.id)] : staff, projects: availableProjects.map(project => ({ id: project.id, name: project.name })), assignments };
}
