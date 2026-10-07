import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/api-security";
import { readBoundedText } from "@/lib/request-body";
import { requestIdentity, takeRateLimit } from "@/lib/rate-limit";
import { invoiceSchema } from "@/lib/tools/invoice";
import { invoicePdf } from "@/lib/tools/invoice-pdf";
import { isLocale } from "@/lib/i18n/config";
export const runtime="nodejs";
export async function POST(request:Request){try{
 assertSameOrigin(request);
 if(!await takeRateLimit(`invoice:${requestIdentity(request.headers)}`,5,60_000))return NextResponse.json({error:"RATE_LIMIT"},{status:429});
 const raw=JSON.parse(await readBoundedText(request,16000));if(!isLocale(raw.locale))throw Error();const data=invoiceSchema.parse(raw);
 const pdf=await invoicePdf(data,raw.locale);
 return new Response(new Uint8Array(pdf),{headers:{"Content-Type":"application/pdf","Content-Disposition":'attachment; filename="blue-sass-invoice.pdf"',"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
 }catch{return NextResponse.json({error:"INVALID_REQUEST"},{status:400});}}
