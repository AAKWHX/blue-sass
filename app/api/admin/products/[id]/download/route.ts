import {NextResponse} from "next/server";
import {eq} from "drizzle-orm";
import {z} from "zod";
import {requirePermission} from "@/lib/db/access";
import {db} from "@/lib/db";
import {marketplaceListings} from "@/lib/db/schema";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){try{await requirePermission("marketplace.manage");const id=z.string().uuid().parse((await params).id);const [row]=await db.select({data:marketplaceListings.assetData,name:marketplaceListings.assetName,type:marketplaceListings.assetType}).from(marketplaceListings).where(eq(marketplaceListings.id,id)).limit(1);if(!row?.data||!row.name)return NextResponse.json({error:"NOT_FOUND"},{status:404});return new Response(new Uint8Array(Buffer.from(row.data,"base64")),{headers:{"Content-Type":row.type??"application/octet-stream","Content-Disposition":`attachment; filename*=UTF-8''${encodeURIComponent(row.name)}`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"sandbox; default-src 'none'"}});}catch{return NextResponse.json({error:"UNAUTHORISED"},{status:403});}}
