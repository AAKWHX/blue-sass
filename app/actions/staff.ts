"use server";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { adminAudit, platformOwner, projectMembers, projects, staffAccess, staffInvitations, users } from "@/lib/db/schema";
import { requireOwner, requirePermission, requireViewer, assertCanViewProject } from "@/lib/db/access";
import { capabilityKeys } from "@/lib/capabilities";
import { canAcceptInvitation, canChangeAccount } from "@/lib/staff-policy";
import { sendEmail, isEmailConfigured } from "@/lib/email/resend";
import { staffInvitationEmail } from "@/lib/email/templates";
import { getSiteUrl } from "@/lib/site-url";
import { isLocale } from "@/lib/i18n/config";
import { takeRateLimit } from "@/lib/rate-limit";
export type StaffState = { ok: boolean; code: string };
const permissionsSchema = z.array(z.enum(capabilityKeys)).max(capabilityKeys.length).refine(values => new Set(values).size === values.length);
const permissionsFrom = (form: FormData) => permissionsSchema.parse(form.getAll("permission"));
const invalidate = () => { revalidatePath("/[locale]/admin", "layout"); revalidatePath("/[locale]/portal", "layout"); };
export async function updateStaffAccess(_previous: StaffState, form: FormData): Promise<StaffState> {
  const actor = await requireOwner();
  const targetId = z.string().uuid().parse(form.get("userId"));
  const permissions = permissionsFrom(form);
  if (!canChangeAccount(actor.id, targetId, actor.id)) return { ok: false, code: "OWNER_PROTECTED" };
  await db.transaction(async tx => {
    const [target] = await tx.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, targetId)).limit(1);
    if (!target) return;
    if (target.email.toLowerCase() === "al3rab@bluesass.nl" && permissions.some(value => !["leads.read", "projects.read_all", "projects.read_assigned"].includes(value))) throw new Error("READ_ONLY_ACCOUNT");
    await tx.update(staffInvitations).set({ revokedAt: new Date() }).where(and(eq(staffInvitations.email, target.email.toLowerCase()), isNull(staffInvitations.acceptedAt), isNull(staffInvitations.revokedAt)));
    await tx.insert(staffAccess).values({ userId: targetId, permissions, updatedBy: actor.id }).onConflictDoUpdate({ target: staffAccess.userId, set: { permissions, updatedBy: actor.id, updatedAt: new Date() } });
    await tx.insert(adminAudit).values({ actorId: actor.id, targetId, action: "permissions.updated", details: { permissions } });
  });
  invalidate(); return { ok: true, code: "SAVED" };
}
export async function setStaffEnabled(_previous: StaffState, form: FormData): Promise<StaffState> {
  const actor = await requireOwner();
  const input = z.object({ userId: z.string().uuid(), enabled: z.enum(["yes", "no"]) }).parse(Object.fromEntries(form));
  if (!canChangeAccount(actor.id, input.userId, actor.id)) return { ok: false, code: "OWNER_PROTECTED" };
  await db.transaction(async tx => {
    const rows = await tx.update(users).set({ disabledAt: input.enabled === "yes" ? null : new Date(), accessVersion: sql`${users.accessVersion} + 1` }).where(eq(users.id, input.userId)).returning({ id: users.id });
    if (rows.length) await tx.insert(adminAudit).values({ actorId: actor.id, targetId: input.userId, action: input.enabled === "yes" ? "account.enabled" : "account.disabled" });
  });
  invalidate(); return { ok: true, code: "SAVED" };
}
export async function inviteStaff(_previous: StaffState, form: FormData): Promise<StaffState> {
  const actor = await requireOwner();
  if (!isEmailConfigured || !takeRateLimit(`staff-invite:${actor.id}`, 5, 600_000)) return { ok: false, code: "DELIVERY_UNAVAILABLE" };
  const email = z.string().trim().email().max(254).parse(form.get("email")).toLowerCase();
  const permissions = permissionsFrom(form);
  if (email === actor.email.toLowerCase()) return { ok: false, code: "OWNER_PROTECTED" };
  if (email === "al3rab@bluesass.nl" && permissions.some(value => !["leads.read", "projects.read_all", "projects.read_assigned"].includes(value))) return { ok: false, code: "READ_ONLY_ACCOUNT" };
  const token = randomBytes(32).toString("hex");
  const invitation = await db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${email}, 0))`);
    await tx.update(staffInvitations).set({ revokedAt: new Date() }).where(and(eq(staffInvitations.email, email), isNull(staffInvitations.acceptedAt), isNull(staffInvitations.revokedAt)));
    const [row] = await tx.insert(staffInvitations).values({ email, permissions, tokenHash: createHash("sha256").update(token).digest("hex"), createdBy: actor.id, expiresAt: new Date(Date.now() + 7 * 86_400_000) }).returning({ id: staffInvitations.id });
    return row;
  });
  const locale = isLocale(String(form.get("locale"))) ? String(form.get("locale")) : "en";
  const site = await getSiteUrl();
  const result = await sendEmail({ to: email, ...staffInvitationEmail(locale, site, `${site}/${locale}/staff/invite#token=${token}`) });
  // Never return the bearer token or expose a working link when mail fails.
  if (!result.ok) { await db.update(staffInvitations).set({ revokedAt: new Date() }).where(eq(staffInvitations.id, invitation.id)); return { ok: false, code: "DELIVERY_UNAVAILABLE" }; }
  await db.insert(adminAudit).values({ actorId: actor.id, targetId: invitation.id, action: "invitation.sent", details: { email, permissions } });
  invalidate(); return { ok: true, code: "INVITATION_SENT" };
}
export async function revokeInvitation(_previous: StaffState, form: FormData): Promise<StaffState> {
  const actor = await requireOwner(); const id = z.string().uuid().parse(form.get("id"));
  await db.transaction(async tx => {
    const rows = await tx.update(staffInvitations).set({ revokedAt: new Date() }).where(and(eq(staffInvitations.id, id), isNull(staffInvitations.acceptedAt), isNull(staffInvitations.revokedAt))).returning({ id: staffInvitations.id });
    if (rows.length) await tx.insert(adminAudit).values({ actorId: actor.id, targetId: id, action: "invitation.revoked" });
  });
  invalidate(); return { ok: true, code: "SAVED" };
}
export async function acceptStaffInvitation(_previous: StaffState, form: FormData): Promise<StaffState> {
  const viewer = await requireViewer();
  const token = z.string().regex(/^[a-f0-9]{64}$/).safeParse(form.get("token"));
  if (!token.success || !takeRateLimit(`staff-accept:${viewer.id}`, 6, 60_000)) return { ok: false, code: "INVITATION_INVALID" };
  const ok = await db.transaction(async tx => {
    const hash = createHash("sha256").update(token.data).digest("hex");
    await tx.execute(sql`select id from ${staffInvitations} where token_hash = ${hash} for update`);
    const [[invitation], [owner], [account]] = await Promise.all([
      tx.select().from(staffInvitations).where(eq(staffInvitations.tokenHash, hash)).limit(1),
      tx.select().from(platformOwner).where(eq(platformOwner.slot, 1)).limit(1),
      tx.select({ verified: sql<boolean>`${users.emailVerified} is not null or exists (select 1 from public.accounts a where a.user_id = ${users.id} and a.provider = 'google')` }).from(users).where(eq(users.id, viewer.id)).limit(1),
    ]);
    if (!invitation || !owner || !account?.verified || viewer.id === owner.userId || !canAcceptInvitation({ ...invitation, email: viewer.email, invitationEmail: invitation.email, creatorId: invitation.createdBy, ownerId: owner.userId })) return false;
    await tx.insert(staffAccess).values({ userId: viewer.id, permissions: invitation.permissions, updatedBy: owner.userId }).onConflictDoUpdate({ target: staffAccess.userId, set: { permissions: invitation.permissions, updatedBy: owner.userId, updatedAt: new Date() } });
    await tx.update(staffInvitations).set({ acceptedAt: new Date() }).where(eq(staffInvitations.id, invitation.id));
    await tx.insert(adminAudit).values({ actorId: viewer.id, targetId: invitation.id, action: "invitation.accepted" });
    return true;
  });
  invalidate(); return { ok, code: ok ? "SAVED" : "INVITATION_INVALID" };
}
export async function assignStaffProject(_previous: StaffState, form: FormData): Promise<StaffState> {
  const actor = await requirePermission("projects.assign");
  const input = z.object({ projectId: z.string().uuid(), userId: z.string().uuid(), mode: z.enum(["assign", "remove"]) }).parse(Object.fromEntries(form));
  await assertCanViewProject(input.projectId);
  await db.transaction(async tx => {
    const [project] = await tx.select({ id: projects.id }).from(projects).where(eq(projects.id, input.projectId)).limit(1);
    const [target] = await tx.select({ id: users.id }).from(users).where(and(eq(users.id, input.userId), isNull(users.disabledAt))).limit(1);
    if (!project || !target) return;
    const [[owner], [access]] = await Promise.all([tx.select().from(platformOwner).where(eq(platformOwner.slot, 1)).limit(1), tx.select().from(staffAccess).where(eq(staffAccess.userId, input.userId)).limit(1)]);
    if (target.id !== owner?.userId && !access?.permissions.some(value => ["projects.read_assigned", "projects.edit_assigned", "projects.read_all", "projects.edit_all"].includes(value))) return;
    if (input.mode === "remove") await tx.delete(projectMembers).where(and(eq(projectMembers.projectId, input.projectId), eq(projectMembers.userId, input.userId)));
    else await tx.insert(projectMembers).values({ projectId: input.projectId, userId: input.userId, role: "employee" }).onConflictDoNothing();
    await tx.insert(adminAudit).values({ actorId: actor.id, targetId: input.projectId, action: input.mode === "assign" ? "project.assigned" : "project.unassigned", details: { userId: input.userId } });
  });
  invalidate(); return { ok: true, code: "SAVED" };
}
