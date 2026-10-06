"use client";
import { useState } from "react";
import { useI18n } from "@/components/providers";
import { platformCopy } from "@/lib/i18n/platform-tools";
import { StaffAccountForm } from "./staff-forms";
import { Button } from "@/components/ui/button";
type Account = { id: string; name: string | null; email: string; permissions: string[]; disabled: boolean; readOnly: boolean };
export function StaffAccountsPanel({ accounts, ownerId }: { accounts: Account[]; ownerId: string }) {
  const { locale } = useI18n(); const c = platformCopy(locale);
  const [selectedId, setSelectedId] = useState(accounts.find(user => user.id === ownerId)?.id ?? accounts[0]?.id ?? "");
  const selected = accounts.find(user => user.id === selectedId) ?? accounts[0];
  if (!selected) return <p className="text-sm text-white/65">{c.empty}</p>;
  return <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]"><div role="group" aria-label={c.accounts} className="grid max-h-96 gap-2 overflow-y-auto rounded-2xl border border-white/20 p-3">{accounts.map(user => <Button key={user.id} type="button" variant="unstyled" size="auto" aria-pressed={user.id === selected.id} onClick={() => setSelectedId(user.id)} className={`block w-full rounded-xl border p-3 text-start ${user.id === selected.id ? "border-white/55 bg-white/10" : "border-white/10 hover:bg-white/5"}`}><span className="block truncate text-sm font-semibold">{user.name || user.email}</span><span dir="ltr" className="mt-1 block truncate text-xs text-white/55">{user.email}</span><span className="mt-2 block text-[10px] text-white/60">{user.id === ownerId ? c.owner : user.disabled ? c.disabled : c.enabled}</span></Button>)}</div><StaffAccountForm key={selected.id} user={selected} ownerId={ownerId}/></div>;
}
