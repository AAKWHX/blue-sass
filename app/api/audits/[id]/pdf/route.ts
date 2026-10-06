import { NextResponse } from "next/server";
import { z } from "zod";
import { renderAuditPdf } from "@/lib/audits/pdf-document";
import { ownedReport } from "@/lib/db/audits";
import { requireViewer, AuthorisationError } from "@/lib/db/access";
import { isLocale } from "@/lib/i18n/config";
import { takeRateLimit } from "@/lib/rate-limit";
export const runtime="nodejs";
export const maxDuration=60;
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const viewer=await requireViewer();const {id}=await params;
    if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:"NOT_FOUND"},{status:404});
    if(!takeRateLimit(`audit-pdf:${viewer.id}`,3,60_000))return NextResponse.json({error:"AUDIT_BUSY"},{status:429});
    const row=await ownedReport(id);if(!row?.report || row.status!=="completed")return NextResponse.json({error:"NOT_FOUND"},{status:404});
    const requested=new URL(request.url).searchParams.get("locale");const locale=isLocale(requested??"")?requested as import("@/lib/i18n/config").Locale:"ar";
    const buffer=await renderAuditPdf(id,row.report,locale);
    return new NextResponse(new Uint8Array(buffer),{headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="Blue-Sass-report-${id.slice(0,8)}.pdf"`,"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow"}});
  }catch(error){if(!(error instanceof AuthorisationError))console.error("[audit-pdf] generation failed",{type:error instanceof Error?error.name:"Unknown"});return NextResponse.json({error:"UNAVAILABLE"},{status:error instanceof AuthorisationError?401:500,headers:{"Cache-Control":"no-store"}});}
}
