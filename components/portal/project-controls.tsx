"use client";
import { useActionState, useState } from "react";
import { useI18n } from "@/components/providers";
import { updateClientProject } from "@/app/actions/client-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function ProjectControls({ project, editable, cancelled }: { project: { id: string; name: string; summary: string }; editable: boolean; cancelled: boolean }) {
 const { locale, t } = useI18n(); const c = t.experience;
 const [mode, setMode] = useState<"cancel" | null>(null);
 const [state, action, pending] = useActionState(updateClientProject, { ok: false, message: "" });
 return <section id="project-options" className="container-x mt-7"><div className="rounded-2xl border border-black/15 bg-white p-5">
  <p className="text-sm leading-7">{cancelled ? c.cancelled : c.editPolicy}</p>
  {editable && !cancelled && <><div className="mt-4 flex flex-wrap gap-3"><Button asChild variant="neon"><Link href={`/${locale}/portal/projects/${project.id}/edit`}>{c.edit}</Link></Button><Button variant="outline" className="border-red-700 text-red-700" onClick={() => setMode(mode === "cancel" ? null : "cancel")}>{c.cancel}</Button></div>
  {mode && <form action={action} className="mt-5 max-w-2xl space-y-4"><input type="hidden" name="locale" value={locale}/><input type="hidden" name="projectId" value={project.id}/><input type="hidden" name="operation" value={mode}/>
   <Input type="hidden" name="name" value={project.name}/><Input type="hidden" name="summary" value={(project.summary || project.name).slice(0, 4000)}/><Input type="hidden" name="confirmed" value="yes"/><p className="rounded-xl border border-line p-4 text-sm leading-7">{c.cancelConfirm}</p>
   <Button type="submit" disabled={pending} variant="neon">{c.confirmCancel}</Button>
  </form>}</>}
  <p role="status" className="mt-3 text-sm">{state.message}</p>
 </div></section>;
}
