"use server";
import { localizeForLocale } from "@/lib/i18n/extra-locales";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { assertCanWrite, requireViewer } from "@/lib/db/access";
import { isLocale } from "@/lib/i18n";

export type ProfileState = { ok: boolean; message: string };

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  company: z.string().trim().max(120).optional(),
  title: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(32).optional(),
  locale: z.string(),
  marketingOptIn: z.string().optional(),
});

function validImageSignature(bytes: Uint8Array, type: string) {
  if (type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

export async function updateProfileAction(_previous: ProfileState, formData: FormData): Promise<ProfileState> {
  const viewer = await requireViewer();
  assertCanWrite(viewer);
  const requestedLocale = formData.get("locale");
  const responseLocale = isLocale(String(requestedLocale)) ? String(requestedLocale) : viewer.locale;
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || !isLocale(parsed.data.locale)) {
    return { ok: false, message: responseLocale === "ar" ? "تحقق من بيانات الملف الشخصي." : localizeForLocale("Please check the profile fields.", responseLocale) };
  }

  let image: string | undefined;
  const upload = formData.get("image");
  if (upload instanceof File && upload.size > 0) {
    if (upload.size > 750_000 || !["image/png", "image/jpeg", "image/webp"].includes(upload.type)) {
      return { ok: false, message: responseLocale === "ar" ? "استخدم صورة PNG أو JPG أو WebP بحجم أقل من 750 KB." : localizeForLocale("Use a PNG, JPG or WebP image smaller than 750 KB.", responseLocale) };
    }
    const bytes = new Uint8Array(await upload.arrayBuffer());
    if (!validImageSignature(bytes, upload.type)) {
      return { ok: false, message: responseLocale === "ar" ? "الملف المحدد ليس صورة شخصية صالحة." : localizeForLocale("The selected file is not a valid profile image.", responseLocale) };
    }
    image = `data:${upload.type};base64,${Buffer.from(bytes).toString("base64")}`;
  }

  const { name, company, title, phone, locale } = parsed.data;
  const [saved] = await db.update(users).set({
    name,
    company: company || null,
    title: title || null,
    phone: phone || null,
    locale,
    marketingOptIn: parsed.data.marketingOptIn === "on",
    ...(image ? { image } : {}),
  }).where(eq(users.id, viewer.id)).returning({ id: users.id });
  if (!saved) {
    return { ok: false, message: responseLocale === "ar" ? "تعذر حفظ الملف الشخصي. أعد تسجيل الدخول وحاول مجددًا." : localizeForLocale("Unable to save your profile. Sign in again and retry.", responseLocale) };
  }

  (await cookies()).set("awwa-locale", locale, {
    path: "/", maxAge: 31_536_000, sameSite: "lax", secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/", "layout");
  revalidatePath(`/${locale}/portal/profile`);
  if (viewer.locale !== locale) redirect(`/${locale}/portal/profile`);
  return { ok: true, message: locale === "ar" ? "تم حفظ الملف الشخصي." : localizeForLocale("Profile saved.", locale) };
}
