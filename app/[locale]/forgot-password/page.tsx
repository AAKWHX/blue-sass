import { notFound } from "next/navigation";
import { RecoveryForm } from "@/components/auth/recovery-form";
import { publicFeatureFlags } from "@/lib/capabilities";
export const metadata = { title: "Account recovery — Blue Sass", robots: { index: false, follow: false } };
export default function RecoveryPage() { if (!publicFeatureFlags.accounts) notFound(); return <section className="container-x flex justify-center py-12 sm:py-20"><RecoveryForm /></section>; }
