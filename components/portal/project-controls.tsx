"use client";
import { useActionState, useState } from "react";
import { useI18n } from "@/components/providers";
import { updateClientProject } from "@/app/actions/client-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ProjectControls({ project, editable, cancelled }: { project: { id: string; name: string; summary: string }; editable: boolean; cancelled: boolean }) {
 const { locale, t } = useI18n(); const c = t.experience;
 const [mode, setMode] = useState<"edit" | "cancel" | null>(null);
 const [state, action, pending] = useActionState(updateClientProject, { ok: false, message: "" });
 return <section id="project-options" className="container-x mt-7"><div className="rounded-2xl border border-black/15 bg-white p-5">
  <p className="text-sm leading-7">{cancelled ? c.cancelled : c.editPolicy}</p>
  {editable && !cancelled && <><div className="mt-4 flex flex-wrap gap-3"><Button variant="neon" onClick={() => setMode(mode === "edit" ? null : "edit")}>{c.edit}</Button><Button variant="outline" className="border-red-700 text-red-700" onClick={() => setMode(mode === "cancel" ? null : "cancel")}>{c.cancel}</Button></div>
  {mode && <form action={action} className="mt-5 max-w-2xl space-y-4"><input type="hidden" name="locale" value={locale}/><input type="hidden" name="projectId" value={project.id}/><input type="hidden" name="operation" value={mode}/>
   {mode === "edit" ? <><Label htmlFor="project-name">{c.name}</Label><Input id="project-name" name="name" defaultValue={project.name} minLength={2} maxLength={120} required/><Label htmlFor="project-summary">{c.summary}</Label><Textarea id="project-summary" name="summary" defaultValue={project.summary} minLength={3} maxLength={4000} rows={7} required/></> : <><input type="hidden" name="name" value={project.name}/><input type="hidden" name="summary" value={project.summary || project.name}/><input type="hidden" name="confirmed" value="yes"/><p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-900">{c.cancelConfirm}</p></>}
   <Button type="submit" disabled={pending} variant="neon">{mode === "edit" ? c.save : c.confirmCancel}</Button>
  </form>}</>}
  <p role="status" className="mt-3 text-sm">{state.message}</p>
 </div></section>;
}
