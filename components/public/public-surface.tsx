"use client";
import { usePathname } from "next/navigation";
import { useRef } from 'react';
import { usePublicMotion } from '@/hooks/use-public-motion';
import './public-interactions.css';
import './scroll-scenes.css';
import './visual-polish.css';
import { publicMotionPath } from '@/lib/public-scene-engine';
import { PublicPageTransition } from './page-transition';
export function PublicSurface({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const path = pathname.split("/")[2] ?? "";
  const marketing = ["", "services", "about", "contact", "projects", "reviews", "pricing", "templates", "subscriptions", "discover", "compare"].includes(path);
  const enhanced = publicMotionPath(pathname);
  usePublicMotion(ref, pathname, enhanced && path !== '');
  return <div ref={ref} className={[marketing ? 'studio-public' : '', enhanced ? 'bs-public-motion' : ''].filter(Boolean).join(' ') || undefined}>{children}<PublicPageTransition/></div>;
}
