"use server";
import {revalidatePath} from "next/cache";
import {requirePermission} from "@/lib/db/access";
import {db} from "@/lib/db";
import {platformContent,adminAudit} from "@/lib/db/schema";
import {metricsSchema} from "@/lib/db/site-content";
export async function saveSiteMetrics(_previous:{ok:boolean},form:FormData){const viewer=await requirePermission("cms.manage");try{const raw=String(form.get("metrics"));if(raw.length>10000)return{ok:false};const metrics=metricsSchema.parse(JSON.parse(raw));await db.transaction(async tx=>{await tx.insert(platformContent).values({key:"public-metrics",metrics,updatedBy:viewer.id}).onConflictDoUpdate({target:platformContent.key,set:{metrics,updatedBy:viewer.id,updatedAt:new Date()}});await tx.insert(adminAudit).values({actorId:viewer.id,action:"site.metrics.saved",details:{count:metrics.length}});});revalidatePath("/","layout");return{ok:true};}catch{return{ok:false};}}
