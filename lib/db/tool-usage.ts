import "server-only";
import {and,eq,gte,ne,sql} from "drizzle-orm";
import {db} from "./index";
import {users,toolUsage,siteAudits} from "./schema";
import {toolEntitlement} from "./audits";
import {quotaUsageQuery} from "./usage-query";
export async function usageSummary(userId:string){const plan=await toolEntitlement(userId);const [scans,ai]=await Promise.all([
 db.select({used:sql<number>`count(*)::integer`}).from(siteAudits).where(and(eq(siteAudits.userId,userId),gte(siteAudits.createdAt,plan.startsAt),ne(siteAudits.status,"failed"))),
 db.select({used:sql<number>`coalesce(sum(credits),0)::integer`}).from(toolUsage).where(and(eq(toolUsage.userId,userId),gte(toolUsage.createdAt,plan.startsAt),ne(toolUsage.status,"failed"))),
 ]);return {...plan,used:scans[0].used+ai[0].used,remaining:Math.max(0,plan.reports-scans[0].used-ai[0].used)};}
export async function reserveToolUsage(userId:string,tool:string,credits=5){const plan=await toolEntitlement(userId);return db.transaction(async tx=>{
 await tx.execute(sql`select id from ${users} where id=${userId} for update`);
 const since=new Date(Date.now()-86_400_000);const [attempts]=await tx.select({n:sql<number>`count(*)::integer`}).from(toolUsage).where(and(eq(toolUsage.userId,userId),gte(toolUsage.createdAt,since)));
 if(attempts.n>=20)throw Error("TOOL_LIMIT");
 await tx.update(toolUsage).set({status:"failed"}).where(and(eq(toolUsage.userId,userId),eq(toolUsage.status,"pending"),sql`${toolUsage.createdAt}<now()-interval '5 minutes'`));
 const [used]=await tx.execute<{used:number}>(quotaUsageQuery(userId,plan.startsAt));
 if(Number(used.used)+credits>plan.reports)throw Error("TOOL_LIMIT");
 const [row]=await tx.insert(toolUsage).values({userId,tool,credits}).returning({id:toolUsage.id});return row.id;
 });}
export async function finishToolUsage(id:string,userId:string,success:boolean){await db.update(toolUsage).set({status:success?"completed":"failed"}).where(and(eq(toolUsage.id,id),eq(toolUsage.userId,userId),eq(toolUsage.status,"pending")));}
