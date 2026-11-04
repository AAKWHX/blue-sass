"use client";
import { PublicPageTransition } from "./page-transition";
import { usePathname } from "next/navigation";
import './public-interactions.css';
import './visual-polish.css';
export function PublicSurface({ children }: { children: React.ReactNode }) {
 const path = usePathname().split("/")[2] ?? "";
 const marketing = ["", "services", "work", "contact", "pricing"].includes(path);
 return <div className={marketing ? "studio-public" : undefined}><PublicPageTransition/>{children}</div>;
}
