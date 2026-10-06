"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { requirePermission } from "@/lib/db/access";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { marketingEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/site-url";

export type AnnouncementState = { ok: boolean; message: string };
const schema = z.object({ title: z.string().trim().min(4).max(120), message: z.string().trim().min(20).max(3000), ctaLabel: z.string().trim().min(2).max(60), ctaUrl: z.string().trim().url().max(500) });

export async function sendAnnouncementAction(_previous: AnnouncementState, formData: FormData): Promise<AnnouncementState> {
  await requirePermission("announcements.send");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "تحقق من عنوان الرسالة والنص والرابط." };
  const siteUrl = await getSiteUrl();
  const cta = new URL(parsed.data.ctaUrl);
  if (cta.protocol !== "https:" && cta.origin !== new URL(siteUrl).origin) return { ok: false, message: "يجب أن يكون رابط الزر HTTPS." };
  const recipients = await db.select({ email: users.email, locale: users.locale }).from(users).where(eq(users.marketingOptIn, true)).limit(500);
  let delivered = 0;
  for (let index = 0; index < recipients.length; index += 10) {
    const batch = recipients.slice(index, index + 10);
    const results = await Promise.all(batch.map((recipient) => sendEmail({ to: recipient.email, ...marketingEmail(recipient.locale, { ...parsed.data, siteUrl }) })));
    delivered += results.filter((result) => result.ok).length;
  }
  return { ok: true, message: `تم إرسال ${delivered} من أصل ${recipients.length} رسالة للمستخدمين الموافقين فقط.` };
}
