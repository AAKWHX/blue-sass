import {NextResponse} from "next/server";
import {and,eq} from "drizzle-orm";
import {z} from "zod";
import {requireViewer} from "@/lib/db/access";
import {db} from "@/lib/db";
import {marketplaceOrders,marketplaceListings,projects,payments} from "@/lib/db/schema";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){try{const viewer=await requireViewer();const id=z.string().uuid().parse((await params).id);
 const [row]=await db.select({data:marketplaceListings.assetData,name:marketplaceListings.assetName,type:marketplaceListings.assetType}).from(marketplaceOrders).innerJoin(projects,eq(projects.id,marketplaceOrders.projectId)).innerJoin(marketplaceListings,eq(marketplaceListings.id,marketplaceOrders.listingId)).innerJoin(payments,eq(payments.projectId,projects.id)).where(and(eq(projects.id,id),eq(projects.clientId,viewer.id),eq(payments.userId,viewer.id),eq(marketplaceOrders.kind,"product"),eq(payments.status,"paid"),eq(payments.environment,"live"))).limit(1);
 if(!row?.data||!row.name)return NextResponse.json({error:"NOT_AVAILABLE"},{status:404});
 return new Response(new Uint8Array(Buffer.from(row.data,"base64")),{headers:{"Content-Type":row.type??"application/octet-stream","Content-Disposition":`attachment; filename*=UTF-8''${encodeURIComponent(row.name)}`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"sandbox; default-src 'none'"}});
 }catch{return NextResponse.json({error:"UNAUTHORISED"},{status:403});}}
