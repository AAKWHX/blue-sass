"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/lib/db";
import { projects, projectFiles } from "@/lib/db/schema";
import { requirePermission, assertCanViewProject } from "@/lib/db/access";
import { portfolioMediaName } from "@/lib/db/portfolio";
import { lifecycleState, lockProject } from "@/lib/db/project-lifecycle";
import { experience } from "@/lib/i18n/experience";
import { isLocale } from "@/lib/i18n/config";
const https = z.string().url().refine(value => value.startsWith("https://"));
const schema = z.object({ id: z.union([z.string().uuid(), z.literal("")]), name: z.string().trim().min(2).max(120), summary: z.string().trim().min(3).max(4000), cover: https, url: z.union([https, z.literal("")]), visibility: z.enum(["public", "private"]), features: z.string().max(2000), images: z.string().max(6000) });
export async function savePortfolio(_prev: { ok: boolean; message: string }, form: FormData) {
 const viewer = await requirePermission("portfolio.manage");
 const locale = String(form.get("locale")); const c = experience(isLocale(locale) ? locale : "en");
 const fail = { ok: false, message: c.error };
 if (!isDatabaseConfigured) return fail;
 const parsed = schema.safeParse(Object.fromEntries(form)); if (!parsed.success) return fail;
 const data = parsed.data; const images = data.images.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
 if (data.id) await assertCanViewProject(data.id);
 if (images.length > 12 || images.some(url => !https.safeParse(url).success)) return fail;
 const ok = await db.transaction(async tx => {
  let id = data.id;
  if (id) {
   const project = await lockProject(tx, id); if (!project || (await lifecycleState(id, tx)).cancelled) return false;
   await tx.update(projects).set({ name: data.name, summary: data.summary, cover: data.cover, visibility: data.visibility, tech: data.features.split(/\r?\n/).map(s => s.trim()).filter(Boolean).slice(0, 30), updatedAt: new Date() }).where(eq(projects.id, id));
  } else {
   const [project] = await tx.insert(projects).values({ slug: `portfolio-${randomUUID()}`, name: data.name, summary: data.summary, cover: data.cover, visibility: data.visibility, tech: data.features.split(/\r?\n/).map(s => s.trim()).filter(Boolean).slice(0, 30), stage: "planning" }).returning({ id: projects.id }); id = project.id;
  }
  // Replace only editorial media, leaving all client deliverables untouched.
  await tx.delete(projectFiles).where(and(eq(projectFiles.projectId, id), eq(projectFiles.name, portfolioMediaName)));
  const media = [...images.map(url => ({ url, kind: "image" as const })), ...(data.url ? [{ url: data.url, kind: "demo" as const }] : [])];
  if (media.length) await tx.insert(projectFiles).values(media.map(item => ({ ...item, projectId: id, name: portfolioMediaName, category: "media" as const, visibleToClient: true, uploadedBy: viewer.id })));
  return true;
 });
 if (!ok) return fail;
 revalidatePath("/[locale]/projects", "page"); revalidatePath("/[locale]", "page"); revalidatePath("/[locale]/admin", "page"); revalidatePath("/[locale]/portal", "layout");
 return { ok: true, message: c.saved };
}
