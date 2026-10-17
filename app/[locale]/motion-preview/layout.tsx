import { notFound } from 'next/navigation';
import { motionLabAllowed } from '@/lib/motion-lab-access';
import { PreviewNavigation } from '@/components/motion-preview/navigation';
import '@/components/motion-preview/preview.css';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Blue Sass — Motion Preview', robots: { index: false, follow: false } };
export default async function MotionPreviewLayout({ children }: { children: React.ReactNode }) {
  if (!(await motionLabAllowed())) notFound();
  return <PreviewNavigation>{children}</PreviewNavigation>;
}
