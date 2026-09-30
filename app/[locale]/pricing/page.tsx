import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/page-metadata";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { return pageMetadata((await params).locale, "/pricing", "أنواع المواقع وأسعار التنفيذ — بلو ساس", "قارن أنواع المواقع والمتاجر والمنصات وأسعار تنفيذها باليورو مع عروض تنفيذ دورية وشروط واضحة."); }
export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) { redirect(`/${(await params).locale}/services#pricing`); }
