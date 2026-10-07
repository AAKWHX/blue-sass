"use client";
import { useActionState, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useI18n } from "@/components/providers";
import { platformCopy } from "@/lib/i18n/platform-tools";
import { capabilityKeys } from "@/lib/capabilities";
import { businessUi } from "@/lib/i18n/business-ui";
import { inviteStaff, updateStaffAccess, setStaffEnabled, revokeInvitation, acceptStaffInvitation, assignStaffProject } from "@/app/actions/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const initial = { ok: false, code: "" };
function Status({ code }: { code: string }) {
  const { locale } = useI18n(); const c = platformCopy(locale);
  return <p role="status" className="mt-3 text-sm leading-7 text-white/75">{code ? c.errors[code as keyof typeof c.errors] ?? c.errors.INVALID_INPUT : ""}</p>;
}
function PermissionList({ prefix, selected = [], readOnly = false }: { prefix: string; selected?: string[]; readOnly?: boolean }) {
  const { locale } = useI18n(); const c = platformCopy(locale);
  return <fieldset className="mt-5"><legend className="text-sm font-semibold">{c.permissions}</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{capabilityKeys.map(key => <Label key={key} htmlFor={`${prefix}-${key}`} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-white/15 p-3 text-sm font-normal leading-6"><Checkbox id={`${prefix}-${key}`} name="permission" value={key} defaultChecked={selected.includes(key)} disabled={readOnly && !["leads.read", "projects.read_all", "projects.read_assigned"].includes(key)} className="mt-1 border-white/35 data-[state=checked]:bg-white data-[state=checked]:text-black"/>{key==='marketplace.manage'?businessUi(locale).moderate:c.capabilities[key]}</Label>)}</div></fieldset>;
}
export function StaffInvitationForm() {
  const { locale } = useI18n(); const c = platformCopy(locale);
  const [state, action, pending] = useActionState(inviteStaff, initial);
  return <Card className="tool-card"><CardHeader><CardTitle className="text-white">{c.invite}</CardTitle></CardHeader><CardContent><form action={action}><Input type="hidden" name="locale" value={locale}/><Label htmlFor="invite-email">{c.email}</Label><Input id="invite-email" name="email" type="email" maxLength={254} required className="mt-2"/><PermissionList prefix="invite"/><Button type="submit" variant="neon" disabled={pending} className="mt-5">{pending ? "…" : c.invite}</Button><Status code={state.code}/></form></CardContent></Card>;
}
export function StaffAccountForm({ user, ownerId }: { user: { id: string; name: string | null; email: string; permissions: string[]; disabled: boolean; readOnly: boolean }; ownerId: string }) {
  const { locale } = useI18n(); const c = platformCopy(locale);
  const [state, action, pending] = useActionState(updateStaffAccess, initial);
  const [enabledState, enableAction, enabling] = useActionState(setStaffEnabled, initial);
  const [confirmed, setConfirmed] = useState(false);
  const owner = user.id === ownerId;
  return <Card className="tool-card"><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="text-white">{user.name || user.email}</CardTitle><p className="mt-2 break-all text-sm text-white/60" dir="ltr">{user.email}</p></div><span className="rounded-full border border-white/25 px-3 py-1 text-xs">{owner ? c.owner : user.disabled ? c.disabled : c.enabled}</span></div></CardHeader><CardContent>{owner ? <p className="text-sm leading-7 text-white/65">{c.protected}</p> : <>
    <form action={action}><Input type="hidden" name="userId" value={user.id}/><PermissionList prefix={user.id} selected={user.permissions} readOnly={user.readOnly}/>{user.readOnly && <p className="mt-3 text-xs leading-7">{c.errors.READ_ONLY_ACCOUNT}</p>}<Button type="submit" variant="neon" disabled={pending} className="mt-5">{pending ? "…" : c.save}</Button><Status code={state.code}/></form>
    <form action={enableAction} className="mt-6 border-t border-white/15 pt-5"><Input type="hidden" name="userId" value={user.id}/><Input type="hidden" name="enabled" value={user.disabled ? "yes" : "no"}/><Label className="flex items-center gap-3" htmlFor={`confirm-${user.id}`}><Checkbox id={`confirm-${user.id}`} checked={confirmed} onCheckedChange={value => setConfirmed(value === true)}/>{c.confirm}</Label><Button type="submit" variant="outline" disabled={!confirmed || enabling} className="mt-4">{user.disabled ? c.reactivate : c.deactivate}</Button><Status code={enabledState.code}/></form>
  </>}</CardContent></Card>;
}
export function RevokeStaffInvitation({ id, active }: { id: string; active: boolean }) {
  const { locale } = useI18n(); const c = platformCopy(locale);
  const [state, action, pending] = useActionState(revokeInvitation, initial);
  return <form action={action}><Input type="hidden" name="id" value={id}/><Button type="submit" variant="outline" size="sm" disabled={!active || pending}>{c.revoke}</Button><Status code={state.code}/></form>;
}
export function ProjectAssignmentForm({ staff, projects, assignments }: { staff: { id: string; name: string | null }[]; projects: { id: string; name: string }[]; assignments: { projectId: string; userId: string; name: string | null }[] }) {
  const { locale } = useI18n(); const c = platformCopy(locale);
  const [state, action, pending] = useActionState(assignStaffProject, initial);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  return <Card className="tool-card"><CardHeader><CardTitle className="text-white">{c.assignment}</CardTitle></CardHeader><CardContent><form action={action} className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="assignment-project">{c.project}</Label><Select name="projectId" value={projectId} onValueChange={setProjectId} required><SelectTrigger id="assignment-project" className="mt-2"><SelectValue/></SelectTrigger><SelectContent>{projects.map(project => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="assignment-staff">{c.member}</Label><Select name="userId" required><SelectTrigger id="assignment-staff" className="mt-2"><SelectValue/></SelectTrigger><SelectContent>{staff.map(user => <SelectItem key={user.id} value={user.id}>{user.name || user.id}</SelectItem>)}</SelectContent></Select></div><Button type="submit" variant="neon" name="mode" value="assign" disabled={pending || !staff.length || !projects.length}>{c.assign}</Button><Button type="submit" variant="outline" name="mode" value="remove" disabled={pending || !staff.length || !projects.length}>{c.remove}</Button></form><Status code={state.code}/><ul className="mt-5 space-y-2 text-sm text-white/65">{assignments.filter(item => item.projectId === projectId).map(item => <li key={item.userId}>{item.name || item.userId}</li>)}</ul></CardContent></Card>;
}
const subscribeHash = (callback: () => void) => { window.addEventListener("hashchange", callback); return () => window.removeEventListener("hashchange", callback); };
const readToken = () => new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
export function StaffInvitationAccept({ signedIn }: { signedIn: boolean }) {
  const { locale, t } = useI18n(); const c = platformCopy(locale);
  const token = useSyncExternalStore(subscribeHash, readToken, () => "");
  const [state, action, pending] = useActionState(acceptStaffInvitation, initial);
  return <Card className="tool-card"><CardHeader><CardTitle className="text-white">{c.accept}</CardTitle><p className="mt-3 text-sm leading-8 text-white/65">{c.inviteHelp}</p></CardHeader><CardContent>{signedIn ? <form action={action}><Input type="hidden" name="token" value={token}/><Button type="submit" variant="neon" disabled={pending || !/^[a-f0-9]{64}$/.test(token) || state.ok}>{c.accept}</Button><Status code={state.code}/>{state.ok && <Button asChild variant="outline" className="mt-4"><Link href={`/${locale}/admin`}>{c.admin}</Link></Button>}</form> : <Button asChild variant="neon"><Link href={`/${locale}/login?next=${encodeURIComponent(`/${locale}/staff/invite`)}`}>{t.auth.signIn}</Link></Button>}</CardContent></Card>;
}
