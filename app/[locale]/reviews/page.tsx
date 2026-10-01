import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ReviewsBoard } from "@/components/public/reviews-board";
import { getViewer } from "@/lib/db/access";
import { db, isDatabaseConfigured } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { isLocale } from "@/lib/i18n";

export const metadata = { title: "آراء عملاء Blue Sass" };

export default async function ReviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [viewer, published] = await Promise.all([
    isDatabaseConfigured ? getViewer() : null,
    isDatabaseConfigured ? db.select().from(reviews).where(eq(reviews.status, "approved")).orderBy(desc(reviews.createdAt)).limit(60).catch(() => []) : [],
  ]);
  return <ReviewsBoard locale={locale} reviews={published} signedIn={Boolean(viewer)} />;
}
