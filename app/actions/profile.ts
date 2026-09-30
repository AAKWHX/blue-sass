"use server";

import { revalidatePath } from "next/cache";
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
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || !isLocale(parsed.data.locale)) {
    return { ok: false, message: "Please check the profile fields." };
  }

  let image: string | undefined;
  const upload = formData.get("image");
  if (upload instanceof File && upload.size > 0) {
    if (upload.size > 750_000 || !["image/png", "image/jpeg", "image/webp"].includes(upload.type)) {
      return { ok: false, message: "Use a PNG, JPG or WebP image smaller than 750 KB." };
    }
    const bytes = new Uint8Array(await upload.arrayBuffer());
    if (!validImageSignature(bytes, upload.type)) {
      return { ok: false, message: "The selected file is not a valid profile image." };
    }
    image = `data:${upload.type};base64,${Buffer.from(bytes).toString("base64")}`;
  }

  const { name, company, title, phone, locale } = parsed.data;
  await db.update(users).set({
    name,
    company: company || null,
    title: title || null,
    phone: phone || null,
    locale,
    ...(image ? { image } : {}),
  }).where(eq(users.id, viewer.id));

  revalidatePath("/", "layout");
  revalidatePath(`/${locale}/portal/profile`);
  return { ok: true, message: locale === "ar" ? "تم حفظ الملف الشخصي." : "Profile saved." };
}
