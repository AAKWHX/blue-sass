import { permanentRedirect, notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
export const metadata = { robots: { index: false, follow: true } };
export default async function RetiredPreview({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  permanentRedirect(`/${locale}/services`);
}
