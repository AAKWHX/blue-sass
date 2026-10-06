"use client";
import { useState } from "react";
import { Minus, Plus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { westernDigits, durationValue } from "@/lib/validation/delivery-duration";

export function DeliveryDuration({ value, minimum, label, minimumLabel, hint, onChange }: { value: number; minimum: number; label: string; minimumLabel: string; hint: string; onChange: (days: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  function commit(days: number) { const next = Math.max(minimum, Math.min(730, days)); setDraft(String(next)); onChange(next); }
  const presets = [...new Set([minimum, Math.max(minimum,14), Math.max(minimum,30), Math.max(minimum,60)])];
  return <div className="mt-6 rounded-2xl border border-white/20 bg-black/25 p-5">
    <Label htmlFor="delivery-days" className="mb-4 text-white"><CalendarDays className="size-5"/>{label}</Label>
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3" dir="ltr">
      <Button type="button" variant="outline" size="icon" aria-label={`${label}: −1`} disabled={value <= minimum} onClick={()=>commit((durationValue(draft,minimum)??value)-1)}><Minus className="size-4"/></Button>
      <Input id="delivery-days" type="text" inputMode="numeric" lang="en" dir="ltr" pattern="[0-9]*" maxLength={3} required value={draft} className="h-14 text-center font-mono text-2xl tabular-nums" aria-describedby="delivery-range" onChange={event=>{const next=westernDigits(event.target.value); if (!/^\d{0,3}$/.test(next)) return; setDraft(next); const days=durationValue(next,minimum); if(days!==null)onChange(days);}} onBlur={()=>commit(/^\d{1,3}$/.test(draft)?Number(draft):minimum)} />
      <Button type="button" variant="outline" size="icon" aria-label={`${label}: +1`} disabled={value>=730} onClick={()=>commit((durationValue(draft,minimum)??value)+1)}><Plus className="size-4"/></Button>
    </div>
    <p id="delivery-range" className="mt-3 text-sm text-white/80">{minimumLabel}: <span dir="ltr" className="font-mono tabular-nums">{minimum}–730</span></p>
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{presets.map(days=><Button key={days} type="button" variant="outline" aria-pressed={value===days} onClick={()=>commit(days)}><span dir="ltr" className="font-mono tabular-nums">{days}</span></Button>)}</div>
    <p className="mt-4 text-sm leading-7 text-white/75">{hint}</p>
  </div>;
}
