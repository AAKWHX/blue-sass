import Link from "next/link";
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { platformCopy } from "@/lib/i18n/platform-tools";
import type { Locale } from "@/lib/i18n/config";
export function AuditPromo({ locale }: { locale: Locale }) {
  const c = platformCopy(locale);
  return <section className="tool-surface py-8"><div className="container-x"><div className="flex flex-col gap-6 rounded-2xl border border-white/15 bg-[#101216] p-6 md:flex-row md:items-center md:justify-between"><div className="max-w-2xl"><FileSearch className="mb-3 size-6 text-white/70"/><h2 className="text-2xl font-semibold">{c.audit}</h2><p className="mt-3 text-sm leading-7 text-white/65">{c.auditIntro}</p></div><Button asChild variant="neon" className="shrink-0"><Link href={`/${locale}/audit`}>{c.run}</Link></Button></div></div></section>;
}
