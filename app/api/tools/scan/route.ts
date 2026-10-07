import {NextResponse} from "next/server";
import {z} from "zod";
import {assertSameOrigin} from "@/lib/api-security";
import {requestIdentity,takeRateLimit} from "@/lib/rate-limit";
import {readBoundedText} from "@/lib/request-body";
import {auditUrl} from "@/lib/audits/network";
import {analyzeWebsite} from "@/lib/audits/website";
import {pageSpeed} from "@/lib/tools/pagespeed";
export const runtime="nodejs";export const maxDuration=60;
export async function POST(request:Request){try{
 assertSameOrigin(request);
 if(!await takeRateLimit(`public-scan:${requestIdentity(request.headers)}`,3,60_000)||!await takeRateLimit("public-scan:global",120,3600_000))return NextResponse.json({error:"RATE_LIMIT"},{status:429});
 const input=z.object({url:z.string().trim().min(8).max(500),tool:z.enum(["website-audit","seo-checker","security-checker","speed-test","privacy-scanner"])}).parse(JSON.parse(await readBoundedText(request,2000)));
 const url=auditUrl(input.url);const report=await analyzeWebsite(url.href);const speed=input.tool==="speed-test"?await pageSpeed(report.pageUrl??url.href):null;
 return NextResponse.json({report,speed},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"SCAN_UNAVAILABLE"},{status:400});}}
