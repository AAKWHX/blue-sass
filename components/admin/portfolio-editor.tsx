"use client";
import { useActionState, useState } from "react";
import { useI18n } from "@/components/providers";
import { savePortfolio } from "@/app/actions/portfolio";
import type { PortfolioEntry } from "@/lib/db/portfolio";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
function Editor({ entry }: { entry?: PortfolioEntry }) {
 const { locale, t } = useI18n(); const c = t.experience;
 const [state, action, pending] = useActionState(savePortfolio, { ok: false, message: "" });
 const [visibility, setVisibility] = useState(entry?.visibility ?? "private");
 return <form action={action} className="mt-5 grid gap-4"><input type="hidden" name="id" value={entry?.id ?? ""}/><input type="hidden" name="locale" value={locale}/><input type="hidden" name="visibility" value={visibility}/>
  <Label htmlFor="work-name">{c.name}</Label><Input id="work-name" name="name" defaultValue={entry?.name} required maxLength={120}/>
  <Label htmlFor="work-summary">{c.summary}</Label><Textarea id="work-summary" name="summary" defaultValue={entry?.summary} required maxLength={4000} rows={5}/>
  <Label htmlFor="work-cover">{c.cover} · HTTPS</Label><Input id="work-cover" type="url" name="cover" defaultValue={entry?.cover ?? ""} required/>
  <Label htmlFor="work-gallery">{c.gallery} · HTTPS</Label><Textarea id="work-gallery" name="images" defaultValue={entry?.images.join("\n")} rows={3}/>
  <Label htmlFor="work-url">{c.url} · HTTPS</Label><Input id="work-url" type="url" name="url" defaultValue={entry?.url}/>
  <Label htmlFor="work-features">{c.features}</Label><Textarea id="work-features" name="features" defaultValue={entry?.features.join("\n")} rows={4}/>
  <Label htmlFor="work-visibility">{c.visibility}</Label><Select value={visibility} onValueChange={value => setVisibility(value as "public" | "private")}><SelectTrigger id="work-visibility"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="private">{c.private}</SelectItem><SelectItem value="public">{c.public}</SelectItem></SelectContent></Select>
  <Button type="submit" variant="neon" disabled={pending}>{c.publish}</Button><p role="status">{state.message}</p>
 </form>;
}
export function PortfolioEditor({ entries }: { entries: PortfolioEntry[] }) {
 const { t } = useI18n(); const [selected, setSelected] = useState("");
 return <section className="container-x py-10"><div className="rounded-3xl border border-black/15 bg-white p-6"><h2 className="text-2xl font-bold">{t.experience.portfolio}</h2><div className="mt-5 flex flex-wrap gap-2"><Button variant={!selected ? "neon" : "outline"} onClick={() => setSelected("")}>+ {t.experience.portfolio}</Button>{entries.map(entry => <Button key={entry.id} variant={selected === entry.id ? "neon" : "outline"} onClick={() => setSelected(entry.id)}>{entry.name}</Button>)}</div><Editor key={selected} entry={entries.find(entry => entry.id === selected)}/></div></section>;
}
