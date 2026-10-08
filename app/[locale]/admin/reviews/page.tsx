import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { moderateReviewAction } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { businessUi } from "@/lib/i18n/business-ui";
import { isLocale } from "@/lib/i18n/config";
import { getViewer, hasCapability } from "@/lib/db/access";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";

export default async function ReviewsAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if(!isLocale(locale)) redirect("/en/admin");
  const labels=businessUi(locale);
  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/login`);
  if (!hasCapability(viewer, "reviews.manage")) redirect(`/${locale}/portal`);
  const rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(100);
  return <main className="tool-surface"><div className="container-x py-16"><h1 className="text-3xl font-semibold text-white">مراجعة آراء العملاء</h1><p className="mt-3 text-ink-low">لا يظهر أي رأي للعامة قبل الموافقة عليه.</p><div className="mt-8 space-y-4">{rows.map(review=><article key={review.id} className="tool-card rounded-2xl border p-6"><div className="flex flex-wrap items-center justify-between gap-3"><strong>{review.displayName} · {review.rating}/5</strong><span className="rounded-full border border-white/20 px-3 py-1 text-xs">{review.status}</span></div><p className="mt-4 whitespace-pre-wrap leading-7 text-white/80">{review.body}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><form action={moderateReviewAction}><Input type="hidden" name="id" value={review.id}/><input type="hidden" name="status" value="approved"/><Button type="submit" variant="neon" size="sm">{labels.publish}</Button></form><form action={moderateReviewAction}><input type="hidden" name="id" value={review.id}/><input type="hidden" name="status" value="rejected"/><Button type="submit" variant="outline" size="sm">{labels.reject}</Button></form></div></article>)}</div></div></main>;
}
