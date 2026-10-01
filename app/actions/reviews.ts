"use server";

import { and, count, eq, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertCanWrite, requireRole, requireViewer } from "@/lib/db/access";
import { db, isDatabaseConfigured } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { isLocale } from "@/lib/i18n";

export type ReviewState = { ok: boolean; message: string };
const reviewSchema = z.object({ rating: z.coerce.number().int().min(1).max(5), body: z.string().trim().min(20).max(1200), locale: z.string() });

export async function submitReviewAction(_previous: ReviewState, formData: FormData): Promise<ReviewState> {
  const viewer = await requireViewer();
  assertCanWrite(viewer);
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  const locale = isLocale(String(formData.get("locale"))) ? String(formData.get("locale")) : "en";
  if (!parsed.success || !isDatabaseConfigured) return { ok: false, message: locale === "ar" ? "تحقق من التقييم والنص (20 حرفًا على الأقل)." : "Check the rating and review (at least 20 characters)." };
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [recent] = await db.select({ value: count() }).from(reviews).where(and(eq(reviews.userId, viewer.id), gte(reviews.createdAt, since)));
  if ((recent?.value ?? 0) >= 2) return { ok: false, message: locale === "ar" ? "يمكن إرسال رأيين كحد أقصى خلال 24 ساعة." : "You can submit up to two reviews in 24 hours." };
  await db.insert(reviews).values({ userId: viewer.id, displayName: viewer.name || "Blue Sass client", company: viewer.company, rating: parsed.data.rating, body: parsed.data.body });
  revalidatePath(`/${locale}/reviews`);
  revalidatePath(`/${locale}/admin/reviews`);
  return { ok: true, message: locale === "ar" ? "وصل رأيك وسيظهر بعد مراجعة الفريق. شكرًا لك." : "Your review was received and will appear after moderation. Thank you." };
}

export async function moderateReviewAction(formData: FormData) {
  await requireRole("super_admin", "admin", "pm");
  const id = z.string().uuid().parse(formData.get("id"));
  const status = z.enum(["approved", "rejected"]).parse(formData.get("status"));
  await db.update(reviews).set({ status, moderatedAt: new Date() }).where(eq(reviews.id, id));
  revalidatePath("/[locale]/reviews", "page");
  revalidatePath("/[locale]/admin/reviews", "page");
}
