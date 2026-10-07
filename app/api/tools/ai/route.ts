import {NextResponse} from "next/server";
import {generateText} from "ai";
import {z} from "zod";
import {assertSameOrigin} from "@/lib/api-security";
import {readBoundedText} from "@/lib/request-body";
import {takeRateLimit} from "@/lib/rate-limit";
import {requireViewer,assertCanWrite} from "@/lib/db/access";
import {reserveToolUsage,finishToolUsage} from "@/lib/db/tool-usage";
import {locales} from "@/lib/i18n/config";
import {aiAvailable} from "@/lib/tools/ai-config";
export const maxDuration=60;
export async function POST(request:Request){let usageId:string|undefined;let userId:string|undefined;try{
 assertSameOrigin(request);const viewer=await requireViewer();assertCanWrite(viewer);userId=viewer.id;
 if(!aiAvailable())return NextResponse.json({error:"UNAVAILABLE"},{status:503});
 if(!await takeRateLimit(`ai:${viewer.id}`,3,60_000))return NextResponse.json({error:"RATE_LIMIT"},{status:429});
 if(!await takeRateLimit("ai:global-daily",20,86_400_000))return NextResponse.json({error:"RATE_LIMIT"},{status:429});
 const input=z.object({tool:z.enum(["business-name-generator","ai-content-generator"]),locale:z.enum(locales),brief:z.string().trim().min(10).max(3000)}).parse(JSON.parse(await readBoundedText(request,14000)));
 usageId=await reserveToolUsage(viewer.id,input.tool);
 const result=await generateText({model:process.env.AI_MODEL as `${string}/${string}`,instructions:`Write in language ${input.locale}. ${input.tool==="business-name-generator"?"Suggest ten distinctive business names with one short rationale each. Do not claim domain availability or trademark clearance.":"Draft useful website copy from the business brief. Never invent testimonials, certifications, customers or factual claims."} Do not include executable HTML.`,prompt:input.brief,maxOutputTokens:1800,abortSignal:AbortSignal.timeout(40000)});
 if(!result.text.trim())throw Error();await finishToolUsage(usageId,viewer.id,true);
 return NextResponse.json({text:result.text.slice(0,16000)},{headers:{"Cache-Control":"private, no-store"}});
 }catch{if(usageId&&userId)await finishToolUsage(usageId,userId,false).catch(()=>undefined);return NextResponse.json({error:"UNAVAILABLE"},{status:400});}}
