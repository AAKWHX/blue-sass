import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicFeatureFlags } from "@/lib/capabilities";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  if (!publicFeatureFlags.portal) notFound();
  return children;
}
