import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/lib/i18n/config";
import { platformCopy } from "@/lib/i18n/platform-tools";
import { getDictionary } from "@/lib/i18n";
import { staffDirectory, assignmentDirectory } from "@/lib/db/staff";
import { StaffInvitationForm, RevokeStaffInvitation, ProjectAssignmentForm } from "@/components/admin/staff-forms";
import { StaffAccountsPanel } from "@/components/admin/staff-accounts-panel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getViewer } from "@/lib/db/access";
import { builderCopy } from "@/lib/i18n/project-builder";
export const metadata = { title: "Blue Sass — Team permissions", robots: { index: false, follow: false } };
export default async function TeamPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string | string[]; p?: string | string[] }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/login?next=/${locale}/admin`);
  if (!viewer.isOwner) redirect(`/${locale}/portal`);
  const rawSearch = await searchParams; const search = { q: typeof rawSearch.q === "string" ? rawSearch.q : "", p: typeof rawSearch.p === "string" ? rawSearch.p : "0" }; const page = Math.max(0, Math.min(1000, Number.parseInt(search.p, 10) || 0));
  const c = platformCopy(locale); const dictionary = getDictionary(locale); const t = { ...dictionary, common: { ...dictionary.common, next: builderCopy.next[locale] } };
  const [directory, assignment] = await Promise.all([staffDirectory(search.q, page), assignmentDirectory()]);
  return <div className="tool-surface py-12"><div className="container-x space-y-8"><h1 className="text-4xl font-bold">{c.team}</h1><p className="max-w-4xl text-sm leading-8 text-white/70">{c.permissionHelp}</p><StaffInvitationForm/><ProjectAssignmentForm {...assignment}/>
    <section><h2 className="mb-5 text-2xl font-semibold">{c.accounts}</h2><form className="mb-5 flex gap-3"><Input name="q" aria-label={t.common.search} placeholder={t.common.search} defaultValue={search.q.slice(0, 120)}/><Button type="submit" variant="outline">{t.common.search}</Button></form><StaffAccountsPanel key={`${search.q}-${page}`} accounts={directory.accounts} ownerId={directory.ownerId}/><div className="mt-5 flex gap-3">{page > 0 && <Button asChild variant="outline"><Link href={`/${locale}/admin/team?q=${encodeURIComponent(search.q)}&p=${page - 1}`}>{t.common.back}</Link></Button>}{directory.accounts.length === 50 && <Button asChild variant="outline"><Link href={`/${locale}/admin/team?q=${encodeURIComponent(search.q)}&p=${page + 1}`}>{t.common.next}</Link></Button>}</div></section>
    <Card className="tool-card"><CardHeader><CardTitle className="text-white">{c.invitations}</CardTitle></CardHeader><CardContent className="space-y-4">{directory.invitations.map(invite => <div key={invite.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/15 p-4"><div><p dir="ltr" className="break-all text-sm">{invite.email}</p><p className="mt-2 text-xs text-white/60">{invite.expires} · {invite.active ? c.enabled : c.disabled}</p></div><RevokeStaffInvitation id={invite.id} active={invite.active}/></div>)}</CardContent></Card>
    <Card className="tool-card"><CardHeader><CardTitle className="text-white">{c.auditLog}</CardTitle></CardHeader><CardContent><ul className="space-y-3">{directory.events.map(event => <li key={event.id} className="rounded-xl border border-white/10 p-4"><p className="text-sm">{event.actor} · {c.events[event.action as keyof typeof c.events] ?? event.action}</p><p className="mt-2 break-all text-xs text-white/55" dir="ltr">{event.actorEmail} · {event.createdAt.slice(0, 19).replace("T", " ")} UTC</p>{Object.keys(event.details).length > 0 && <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all text-xs text-white/65" dir="ltr">{JSON.stringify(event.details, null, 2)}</pre>}{event.targetId && /^(price\.|stage\.|project\.)/.test(event.action) && <Button asChild variant="outline" size="sm" className="mt-3"><Link href={`/${locale}/portal/projects/${event.targetId}`}>{c.project}</Link></Button>}</li>)}</ul></CardContent></Card>
  </div></div>;
}
