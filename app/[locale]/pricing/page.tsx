import { WebsitePricing } from "@/components/public/website-pricing";
import { pageMetadata } from "@/lib/page-metadata";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { return pageMetadata((await params).locale, "/pricing", "أنواع المواقع وأسعار التنفيذ — بلو ساس", "قارن أنواع المواقع والمتاجر والمنصات وأسعار تنفيذها باليورو مع خصم 10% على التنفيذ وشروط واضحة."); }
export default function PricingPage() { return <WebsitePricing/>; }
