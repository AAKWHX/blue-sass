import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { siteAudits } from "@/lib/db/schema";
import { requireViewer, assertCanWrite } from "@/lib/db/access";
import { assertSameOrigin } from "@/lib/api-security";
import { shareTokenHash, shareExpiresAt } from "@/lib/audits/sharing";
import { takeRateLimit } from "@/lib/rate-limit";
import { isLocale } from "@/lib/i18n/config";
import { readBoundedText } from "@/lib/request-body";
export const runtime = "nodejs";
type Context = { params: Promise<{id:string}> };
export async function POST(request: Request, context: Context) {
  try {
    assertSameOrigin(request); const viewer = await requireViewer(); assertCanWrite(viewer);
    const {id}=await context.params; if (!z.string().uuid().safeParse(id).success) return NextResponse.json({error:"INVALID_INPUT"},{status:400});
    if (!(await takeRateLimit(`audit-share:${viewer.id}`,5,60_000))) return NextResponse.json({error:"AUDIT_BUSY"},{status:429});
    const input = await readBoundedText(request, 200);
    const body = JSON.parse(input); if(body.consent!==true || !isLocale(body.locale)) return NextResponse.json({error:"INVALID_INPUT"},{status:400});
    const token = randomBytes(32).toString("hex"); const expiresAt = shareExpiresAt();
    const rows=await db.update(siteAudits).set({shareTokenHash:shareTokenHash(token),shareExpiresAt:expiresAt}).where(and(eq(siteAudits.id,id),eq(siteAudits.userId,viewer.id),eq(siteAudits.status,"completed"))).returning({id:siteAudits.id});
    if (!rows.length) return NextResponse.json({error:"NOT_FOUND"},{status:404});
    return NextResponse.json({path:`/${body.locale}/shared-report/${token}`,expiresAt:expiresAt.toISOString()},{headers:{"Cache-Control":"private, no-store"}});
  } catch { return NextResponse.json({error:"UNAVAILABLE"},{status:403}); }
}
export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request); const viewer = await requireViewer(); assertCanWrite(viewer);
    const {id}=await context.params; if(!z.string().uuid().safeParse(id).success) return NextResponse.json({error:"INVALID_INPUT"},{status:400});
    const rows=await db.update(siteAudits).set({shareTokenHash:null,shareExpiresAt:null}).where(and(eq(siteAudits.id,id),eq(siteAudits.userId,viewer.id))).returning({id:siteAudits.id});
    return NextResponse.json({ok:Boolean(rows.length)},{status:rows.length?200:404,headers:{"Cache-Control":"private, no-store"}});
  } catch { return NextResponse.json({error:"UNAVAILABLE"},{status:403}); }
}
