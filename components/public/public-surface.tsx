"use client";
import { usePathname } from "next/navigation";
export function PublicSurface({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const path = pathname.split("/")[2] ?? "";
  const marketing = ["", "services", "about", "contact", "projects", "reviews", "pricing", "templates", "subscriptions"].includes(path);
  return <div className={marketing ? "studio-public" : undefined}>{children}</div>;
}
