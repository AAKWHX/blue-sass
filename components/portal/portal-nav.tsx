"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, CircleCheck, SlidersHorizontal } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Button } from "@/components/ui/button";
export function PortalNav({ locale }: { locale: string }) {
 const { t } = useI18n(); const path = usePathname(); const c = t.experience;
 const items = [{ path: "", name: c.allProjects, icon: LayoutDashboard }, { path: "/active", name: c.active, icon: FolderKanban }, { path: "/completed", name: c.completed, icon: CircleCheck }, { path: "/change-request", name: c.changes, icon: SlidersHorizontal }];
 return <nav aria-label={t.nav.portal} className="container-x mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{items.map(item => <Button asChild key={item.path} variant="unstyled" className={`min-h-14 justify-start rounded-xl border px-4 py-3 text-sm font-bold ${path === `/${locale}/portal${item.path}` ? "border-black bg-black text-white" : "border-black/20 bg-neon-cyan/30 text-black hover:bg-neon-cyan"}`}><Link href={`/${locale}/portal${item.path}`} aria-current={path === `/${locale}/portal${item.path}` ? "page" : undefined}><item.icon className="size-5 shrink-0"/>{item.name}</Link></Button>)}</nav>;
}
