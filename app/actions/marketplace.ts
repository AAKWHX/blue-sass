"use server";
import {randomUUID} from "node:crypto";
import {and,eq,sql} from "drizzle-orm";
import {z} from "zod";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {db} from "@/lib/db";
import {marketplaceListings as listings,marketplaceOffers,marketplaceOrders,projects,adminAudit} from "@/lib/db/schema";
import {requireViewer,assertCanWrite,requirePermission} from "@/lib/db/access";
import {takeRateLimit} from "@/lib/rate-limit";
import {listingKinds,listingCategories,jobTiers,type JobTier} from "@/lib/marketplace";
import {visibleListing} from "@/lib/db/marketplace";
import {isLocale} from "@/lib/i18n/config";
import {toolsUi} from "@/lib/i18n/tools-ui";
export type MarketplaceState={ok:boolean;message:string};
const inputSchema=z.object({kind:z.enum(listingKinds),title:z.string().trim().min(5).max(160),description:z.string().trim().min(30).max(6000),category:z.enum(listingCategories),price:z.coerce.number().int().min(0).max(100000),tier:z.enum(["basic","featured","premium","urgent"]),company:z.string().trim().max(160),location:z.string().trim().max(120)});
function refresh(){revalidatePath("/[locale]/jobs","page");revalidatePath("/[locale]/marketplace","page");revalidatePath("/[locale]/products","page");revalidatePath("/[locale]/portal/listings","page");revalidatePath("/[locale]/admin/marketplace","page");}
async function createCheckout(tx:Parameters<Parameters<typeof db.transaction>[0]>[0],userId:string,listingId:string,kind:string,snapshot:{title:string;price:number;tier:string}){
 const [project]=await tx.insert(projects).values({slug:`purchase-${randomUUID()}`,name:snapshot.title,summary:`${kind}\n${snapshot.tier}\nEUR ${snapshot.price}`,clientId:userId,industry:"commerce",budget:snapshot.price,visibility:"private"}).returning({id:projects.id});
 await tx.insert(marketplaceOrders).values({projectId:project.id,listingId,kind,snapshot});return project.id;
}
export async function createListingAction(_previous:MarketplaceState,form:FormData):Promise<MarketplaceState>{
 const viewer=await requireViewer();assertCanWrite(viewer);const locale=isLocale(String(form.get("locale")))?String(form.get("locale")) as Parameters<typeof toolsUi>[0]:"en";
 const data=inputSchema.safeParse(Object.fromEntries(form));if(!data.success||!await takeRateLimit(`listing:${viewer.id}`,4,3600_000))return{ok:false,message:toolsUi(locale).error};
 const input=data.data;let assetData:string|null=null;let assetName:string|null=null;let assetType:string|null=null;const file=form.get("file");
 if(input.kind==="product"&&file instanceof File&&file.size){
  if(file.size>3_000_000||!/^.{1,120}\.(zip|pdf|txt|json)$/i.test(file.name))return{ok:false,message:toolsUi(locale).error};
  const bytes=Buffer.from(await file.arrayBuffer());const ext=file.name.split(".").at(-1)!.toLowerCase();
  if((ext==="zip"&&!(bytes[0]===0x50&&bytes[1]===0x4b))||(ext==="pdf"&&!bytes.subarray(0,5).equals(Buffer.from("%PDF-"))))return{ok:false,message:toolsUi(locale).error};
  if(["txt","json"].includes(ext)&&bytes.includes(0))return{ok:false,message:toolsUi(locale).error};
  assetData=bytes.toString("base64");assetName=file.name;assetType=ext==="zip"?"application/zip":ext==="pdf"?"application/pdf":ext==="json"?"application/json":"text/plain";
 }
 const platformProduct=viewer.isOwner&&input.kind==="product"&&form.get("platformProduct")==="on";
 if(platformProduct&&(!assetData||input.price<1))return{ok:false,message:toolsUi(locale).error};
 await db.transaction(async tx=>{
  const [row]=await tx.insert(listings).values({...input,userId:viewer.id,price:input.kind==="job"?jobTiers[input.tier].price:input.price,platformProduct,assetData,assetName,assetType}).returning({id:listings.id});
  if(input.kind==="job"&&input.tier!=="basic")return{payment:await createCheckout(tx,viewer.id,row.id,"job",{title:input.title,price:jobTiers[input.tier].price,tier:input.tier})};return{payment:null};
 });refresh();redirect(`/${locale}/portal/listings`);
}
export async function moderateListingAction(form:FormData){const viewer=await requirePermission("marketplace.manage");const id=z.string().uuid().parse(form.get("id"));const status=z.enum(["approved","rejected"]).parse(form.get("status"));
 await db.transaction(async tx=>{const [row]=await tx.update(listings).set({status,moderatedAt:new Date()}).where(eq(listings.id,id)).returning({id:listings.id});if(!row)throw Error("NOT_FOUND");await tx.insert(adminAudit).values({actorId:viewer.id,targetId:id,action:`listing.${status}`});});refresh();}
export async function archiveListingAction(form:FormData){const viewer=await requireViewer();assertCanWrite(viewer);const id=z.string().uuid().parse(form.get("id"));const [row]=await db.update(listings).set({status:"archived"}).where(and(eq(listings.id,id),eq(listings.userId,viewer.id))).returning({id:listings.id});if(!row)throw Error("NOT_FOUND");refresh();}
export async function offerAction(_previous:MarketplaceState,form:FormData):Promise<MarketplaceState>{const viewer=await requireViewer();assertCanWrite(viewer);const locale=isLocale(String(form.get("locale")))?String(form.get("locale")) as Parameters<typeof toolsUi>[0]:"en";
 const parsed=z.object({listingId:z.string().uuid(),message:z.string().trim().min(20).max(3000),amount:z.coerce.number().int().min(0).max(100000)}).safeParse(Object.fromEntries(form));if(!parsed.success||!await takeRateLimit(`offer:${viewer.id}`,10,3600_000))return{ok:false,message:toolsUi(locale).error};
 const row=await visibleListing(parsed.data.listingId);if(!row||row.userId===viewer.id||row.platformProduct)return{ok:false,message:toolsUi(locale).error};
 const [saved]=await db.insert(marketplaceOffers).values({...parsed.data,userId:viewer.id}).onConflictDoNothing().returning({id:marketplaceOffers.id});if(!saved)return{ok:false,message:toolsUi(locale).error};revalidatePath("/[locale]/listings/[id]","page");return{ok:true,message:toolsUi(locale).submit+" ✓"};}
export async function buyProductAction(form:FormData){const viewer=await requireViewer();assertCanWrite(viewer);const id=z.string().uuid().parse(form.get("id"));const locale=String(form.get("locale"));if(!isLocale(locale)||!await takeRateLimit(`purchase:${viewer.id}`,4,60_000))throw Error("INVALID_REQUEST");
 const projectId=await db.transaction(async tx=>{await tx.execute(sql`select id from ${listings} where id=${id} for update`);const [row]=await tx.select({id:listings.id,title:listings.title,price:listings.price,status:listings.status,platformProduct:listings.platformProduct,assetName:listings.assetName,kind:listings.kind}).from(listings).where(eq(listings.id,id));
 if(!row||row.status!=="approved"||!row.platformProduct||!row.assetName||row.price<1||row.kind!=="product")throw Error("NOT_AVAILABLE");return createCheckout(tx,viewer.id,id,"product",{title:row.title,price:row.price,tier:"digital"});});revalidatePath("/[locale]/portal/purchases","page");redirect(`/${locale}/portal/projects/${projectId}/payment`);}
