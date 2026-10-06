import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { moderateReviewAction } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import { getViewer, hasCapability } from "@/lib/db/access";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";

export default async function ReviewsAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const viewer = await getViewer();
  if (!viewer) redirect(`/${locale}/login`);
  if (!hasCapability(viewer, "reviews.manage")) redirect(`/${locale}/portal`);
  const rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(100);
  return <main className="bg-base"><div className="container-x py-16"><h1 className="text-4xl font-black text-black">مراجعة آراء العملاء</h1><p className="mt-3 text-ink-low">لا يظهر أي رأي للعامة قبل الموافقة عليه.</p><div className="mt-8 space-y-4">{rows.map(review=><article key={review.id} className="rounded-2xl border border-black/10 bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-3"><strong>{review.displayName} · {review.rating}/5</strong><span className="rounded-full bg-base px-3 py-1 text-xs">{review.status}</span></div><p className="mt-4 whitespace-pre-wrap leading-7 text-black/70">{review.body}</p><div className="mt-5 flex gap-2"><form action={moderateReviewAction}><input type="hidden" name="id" value={review.id}/><input type="hidden" name="status" value="approved"/><Button type="submit" variant="neon" size="sm">نشر</Button></form><form action={moderateReviewAction}><input type="hidden" name="id" value={review.id}/><input type="hidden" name="status" value="rejected"/><Button type="submit" variant="outline" size="sm">رفض</Button></form></div></article>)}</div></div></main>;
}
