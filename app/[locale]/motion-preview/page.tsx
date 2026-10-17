import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { serviceCatalog } from '@/lib/service-catalog';
import { MotionPreview } from '@/components/motion-preview/story';
export default async function MotionPreviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const catalog = serviceCatalog(locale);
  return <MotionPreview locale={locale} services={[catalog[0],catalog[5],catalog[6]]}/>;
}
