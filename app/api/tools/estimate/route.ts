import {NextResponse} from "next/server";
import {z} from "zod";
import {assertSameOrigin} from "@/lib/api-security";
import {readBoundedText} from "@/lib/request-body";
import {requestIdentity,takeRateLimit} from "@/lib/rate-limit";
import {projectOption,initialConfiguration,configuredEstimate,featureOptions,moduleOptions} from "@/lib/project-options";
export async function POST(request:Request){try{
 assertSameOrigin(request);if(!await takeRateLimit(`estimate:${requestIdentity(request.headers)}`,30,60_000))return NextResponse.json({error:"RATE_LIMIT"},{status:429});
 const input=z.object({kind:z.string().max(60),features:z.array(z.string().max(30)).max(14),modules:z.array(z.string().max(30)).max(20).default([]),languages:z.number().int().min(1).max(15),pages:z.number().int().min(1).max(100)}).parse(JSON.parse(await readBoundedText(request,2000)));
 const option=projectOption(input.kind);if(!option)throw Error();const config=initialConfiguration(option.type,option.id);if(input.features.some(value=>!featureOptions[option.type].includes(value as never)))throw Error();
 config.features=[...new Set([...config.features,...input.features as typeof config.features])];config.languages=Array.from({length:input.languages},(_,i)=>String(i));
 if(input.modules.some(id=>!moduleOptions.some(option=>option.id===id&&option.types.includes(config.type))))throw Error();config.modules=[...new Set(input.modules)];
 const result=configuredEstimate(config);const extraPages=Math.max(0,input.pages-5)*20;
 return NextResponse.json({low:result.totalLow+extraPages,high:result.totalHigh+Math.round(extraPages*1.25),days:result.minimumDays},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"INVALID_INPUT"},{status:400});}}
