import Link from "next/link";
import { ClipboardList, FolderKanban, SlidersHorizontal } from "lucide-react";

export function PortalNav({ locale }: { locale: string }) {
  const ar = locale === "ar";
  const links = [
    { href: `/${locale}/portal/active`, label: ar ? "المشاريع قيد التنفيذ" : "Active projects", icon: FolderKanban },
    { href: `/${locale}/portal/completed`, label: ar ? "المشاريع المكتملة" : "Completed projects", icon: ClipboardList },
    { href: `/${locale}/portal/change-request`, label: ar ? "تعديل المشروع وخياراته" : "Project changes & options", icon: SlidersHorizontal },
  ];
  return <nav aria-label={ar ? "خيارات المشروع" : "Project options"} className="container-x mt-5 flex flex-wrap gap-2">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-white/[0.02] px-3 py-2 text-sm font-semibold text-ink-low transition hover:border-neon-cyan/50 hover:text-ink-hi"><Icon className="size-4 text-neon-cyan"/>{label}</Link>)}</nav>;
}
