"use server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { adminAudit, payments, projectAgreements, projectBilling, projectDecisions } from "@/lib/db/schema";
import { assertCanEditProject, assertCanViewProject, requirePermission, requireViewer, assertCanWrite, hasCapability } from "@/lib/db/access";
import { lifecycleState, lockProject } from "@/lib/db/project-lifecycle";
import { mayEditAgreement, mayAcceptAgreement } from "@/lib/project-agreement";
import { takeRateLimit } from "@/lib/rate-limit";
export type WorkspaceState = { ok: boolean; code: string };
const invalidate = () => { revalidatePath("/[locale]/portal", "layout"); revalidatePath("/[locale]/admin", "layout"); };
const lines = (value: string) => value.split(/\r?\n/).map(line => line.trim()).filter(Boolean).slice(0, 30);
export async function saveProjectAgreement(_state: WorkspaceState, form: FormData): Promise<WorkspaceState> {
  const viewer = await requirePermission("billing.approve");
  const input = z.object({ projectId: z.string().uuid(), included: z.string().min(3).max(4000), excluded: z.string().max(4000), revisionRounds: z.coerce.number().int().min(0).max(20), deliveryDays: z.coerce.number().int().min(2).max(365) }).safeParse(Object.fromEntries(form));
  if (!input.success) return { ok: false, code: "INVALID_INPUT" };
  await assertCanViewProject(input.data.projectId);
  const ok = await db.transaction(async tx => {
    const project = await lockProject(tx, input.data.projectId); if (!project || !project.clientId || project.industry === "subscription") return false;
    const state = await lifecycleState(project.id, tx);
    const [active] = await tx.select({ id: payments.id }).from(payments).where(and(eq(payments.projectId, project.id), inArray(payments.status, ["pending", "paid"]))).limit(1);
    if (!mayEditAgreement({ stage: project.stage, cancelled: state.cancelled, locked: state.locked, hasPayment: Boolean(active) })) return false;
    const [[previous], [billing]] = await Promise.all([tx.select().from(projectAgreements).where(eq(projectAgreements.projectId, project.id)).limit(1), tx.select().from(projectBilling).where(eq(projectBilling.projectId, project.id)).limit(1)]);
    const agreement = { version: (previous?.agreement.version ?? 0) + 1, included: lines(input.data.included), excluded: lines(input.data.excluded), revisionRounds: input.data.revisionRounds, deliveryDays: input.data.deliveryDays, priceCents: billing?.approvedTotalCents ?? null, acceptedAt: null, acceptedBy: null };
    await tx.insert(projectAgreements).values({ projectId: project.id, agreement, updatedBy: viewer.id }).onConflictDoUpdate({ target: projectAgreements.projectId, set: { agreement, updatedBy: viewer.id, updatedAt: new Date() } });
    await tx.insert(adminAudit).values({ actorId: viewer.id, targetId: project.id, action: "scope.updated", details: { version: agreement.version } });
    return true;
  });
  invalidate(); return { ok, code: ok ? "SAVED" : "AGREEMENT_LOCKED" };
}
export async function acceptProjectAgreement(_state: WorkspaceState, form: FormData): Promise<WorkspaceState> {
  const viewer = await requireViewer();
  assertCanWrite(viewer);
  const input = z.object({ projectId: z.string().uuid(), version: z.coerce.number().int().positive(), consent: z.literal("yes") }).safeParse(Object.fromEntries(form));
  if (!input.success) return { ok: false, code: "INVALID_INPUT" };
  const ok = await db.transaction(async tx => {
    const project = await lockProject(tx, input.data.projectId); if (!project) return false;
    const [[row], [billing]] = await Promise.all([tx.select().from(projectAgreements).where(eq(projectAgreements.projectId, project.id)).limit(1), tx.select().from(projectBilling).where(eq(projectBilling.projectId, project.id)).limit(1)]);
    if (!row || !mayAcceptAgreement({ clientId: project.clientId, viewerId: viewer.id, version: row.agreement.version, submittedVersion: input.data.version, priceCents: row.agreement.priceCents, approvedPriceCents: billing?.approvedTotalCents ?? null, cancelled: (await lifecycleState(project.id, tx)).cancelled })) return false;
    await tx.update(projectAgreements).set({ agreement: { ...row.agreement, acceptedAt: new Date().toISOString(), acceptedBy: viewer.id } }).where(eq(projectAgreements.projectId, project.id));
    await tx.insert(adminAudit).values({ actorId: viewer.id, targetId: project.id, action: "scope.accepted", details: { version: row.agreement.version } });
    return true;
  });
  invalidate(); return { ok, code: ok ? "SAVED" : "AGREEMENT_LOCKED" };
}
export async function requestProjectDecision(_state: WorkspaceState, form: FormData): Promise<WorkspaceState> {
  const input = z.object({ projectId: z.string().uuid(), title: z.string().trim().min(3).max(120), detail: z.string().trim().min(3).max(3000), price: z.string().max(20).optional(), extraDays: z.string().max(4).optional() }).safeParse(Object.fromEntries(form));
  if (!input.success) return { ok: false, code: "INVALID_INPUT" };
  const viewer = await assertCanEditProject(input.data.projectId);
  const price = input.data.price?.trim() || ""; const days = input.data.extraDays?.trim() || "";
  if ((price || days) && !hasCapability(viewer, "billing.approve")) return { ok: false, code: "INVALID_INPUT" };
  if ((price && !/^\d{1,6}(\.\d{1,2})?$/.test(price)) || (days && !/^\d{1,3}$/.test(days))) return { ok: false, code: "INVALID_INPUT" };
  if (!takeRateLimit(`decision:${viewer.id}`, 10, 60_000)) return { ok: false, code: "AUDIT_BUSY" };
  const ok = await db.transaction(async tx => {
    const project = await lockProject(tx, input.data.projectId);
    if (!project || (await lifecycleState(project.id, tx)).cancelled || project.industry === "subscription") return false;
    await tx.insert(projectDecisions).values({ projectId: project.id, title: input.data.title, detail: input.data.detail, priceCents: price ? Math.round(Number(price) * 100) : null, extraDays: days ? Number(days) : null, requestedBy: viewer.id });
    return true;
  });
  invalidate(); return { ok, code: ok ? "SAVED" : "INVALID_INPUT" };
}
export async function answerProjectDecision(_state: WorkspaceState, form: FormData): Promise<WorkspaceState> {
  const viewer = await requireViewer();
  assertCanWrite(viewer);
  const input = z.object({ id: z.string().uuid(), state: z.enum(["approved", "changes_requested"]), response: z.string().trim().max(2000) }).safeParse(Object.fromEntries(form));
  if (!input.success) return { ok: false, code: "INVALID_INPUT" };
  const ok = await db.transaction(async tx => {
    await tx.execute(sql`select id from ${projectDecisions} where id = ${input.data.id} for update`);
    const [decision] = await tx.select().from(projectDecisions).where(eq(projectDecisions.id, input.data.id)).limit(1);
    if (!decision || decision.state !== "pending") return false;
    const project = await lockProject(tx, decision.projectId);
    if (!project || project.clientId !== viewer.id || (await lifecycleState(project.id, tx)).cancelled) return false;
    await tx.update(projectDecisions).set({ state: input.data.state, response: input.data.response || null, answeredBy: viewer.id, answeredAt: new Date() }).where(eq(projectDecisions.id, decision.id));
    await tx.insert(adminAudit).values({ actorId: viewer.id, targetId: project.id, action: "decision.answered", details: { decisionId: decision.id, state: input.data.state } });
    return true;
  });
  invalidate(); return { ok, code: ok ? "SAVED" : "INVALID_INPUT" };
}
