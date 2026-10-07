import "server-only";
import {and,eq,inArray} from "drizzle-orm";
import {db} from "./index";
import {payments,projectFiles,projectBilling,projectMilestones,type Project} from "./schema";
import {lifecycleUrls} from "./project-lifecycle";
import {getPayPalEnvironment} from "../paypal";
import {installmentSchedule,installmentReadiness} from "../installments";
/** Caller supplies projects already filtered by visibleProjectsFilter. */
export async function projectListSnapshots(rows:Project[],userId:string){
 if(!rows.length)return new Map<string,{state:{cancelled:boolean;locked:boolean};payment:{status:"pending"|"paid"|"failed"}|null}>();
 const ids=rows.map(row=>row.id);const [files,paid,billing,milestones]=await Promise.all([
 db.select({projectId:projectFiles.projectId,url:projectFiles.url}).from(projectFiles).where(and(inArray(projectFiles.projectId,ids),inArray(projectFiles.url,Object.values(lifecycleUrls)))),
 db.select({projectId:payments.projectId,billingStage:payments.billingStage,status:payments.status}).from(payments).where(and(inArray(payments.projectId,ids),eq(payments.userId,userId),eq(payments.environment,getPayPalEnvironment()))),
 db.select({projectId:projectBilling.projectId,total:projectBilling.approvedTotalCents}).from(projectBilling).where(inArray(projectBilling.projectId,ids)),
 db.select({projectId:projectMilestones.projectId,stage:projectMilestones.stage,status:projectMilestones.status}).from(projectMilestones).where(inArray(projectMilestones.projectId,ids)),
 ]);
 return new Map(rows.map(row=>{
 const state={cancelled:files.some(f=>f.projectId===row.id&&f.url===lifecycleUrls.cancelled),locked:files.some(f=>f.projectId===row.id&&f.url===lifecycleUrls.locked)};
 const bill=billing.find(b=>b.projectId===row.id);const entries=paid.filter(p=>p.projectId===row.id);let payment=null;
 if(bill){const schedule=bill.total?installmentSchedule(bill.total).map(item=>({...item,payment:entries.find(p=>p.billingStage===item.stage)??null})):[];const next=installmentReadiness(schedule,milestones.filter(m=>m.projectId===row.id)).next;payment=next?.payment??(!next&&schedule.length===6?schedule.at(-1)?.payment:null)??null;}else payment=entries.find(p=>p.billingStage==="legacy")??null;
 return [row.id,{state,payment}] as const;
 }));
}
