import { redirect } from "next/navigation";
import { publicPageMetadata } from "@/lib/i18n/seo";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { return publicPageMetadata((await params).locale, "services", "/services"); }
export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) { redirect(`/${(await params).locale}/services`); }
