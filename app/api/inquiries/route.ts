import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { assertSameOrigin } from "@/lib/api-security";
import { readBoundedText } from "@/lib/request-body";
import { inquirySchema } from "@/lib/validation/inquiry";
import { db,isDatabaseConfigured } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { requestIdentity,takeRateLimit } from "@/lib/rate-limit";
export async function POST(request:Request) {
 try {
  const url=new URL(request.url);
  // next dev binds 0.0.0.0, while the browser uses a loopback hostname.
  // This exception is restricted to the local dev listener, never production.
  if(process.env.NODE_ENV==="development"&&url.hostname==="0.0.0.0") {
   const host=request.headers.get("host");
   if(host===`localhost:${url.port}`)url.hostname="localhost";
   else if(host===`127.0.0.1:${url.port}`)url.hostname="127.0.0.1";
  }
  assertSameOrigin(new Request(url,{headers:request.headers}));
 } catch {return NextResponse.json({error:"ORIGIN"},{status:403});}
 let input;
 try { input=inquirySchema.safeParse(JSON.parse(await readBoundedText(request,12000))); }
 catch {return NextResponse.json({error:"INVALID"},{status:400});}
 if(!input.success)return NextResponse.json({error:"INVALID",fields:[...new Set(input.error.issues.map(issue=>String(issue.path[0])))]},{status:400});
 if(!isDatabaseConfigured)return NextResponse.json({error:"UNAVAILABLE"},{status:503});
 const data=input.data;
 if(!await takeRateLimit(`inquiry-ip:${requestIdentity(request.headers)}`,5,600000)||!await takeRateLimit(`inquiry-email:${data.email}`,3,3600000))return NextResponse.json({error:"LIMIT"},{status:429});
 try {
  await db.insert(leads).values({name:data.name,email:data.email,company:data.company||null,locale:data.locale,projectType:data.projectType,services:[],currency:"EUR",message:`Public inquiry\nBudget preference (not a quote): ${data.budget}\n\n${data.message}`});
  revalidatePath(`/${data.locale}/admin/quotes`);
  return NextResponse.json({ok:true},{status:201,headers:{"Cache-Control":"no-store"}});
 } catch {console.error("[inquiries] Unable to save inquiry");return NextResponse.json({error:"UNAVAILABLE"},{status:503});}
}
