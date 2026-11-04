import 'server-only';
import {and,eq,or} from 'drizzle-orm';
import {db} from './index';
import {payments,projects,type Payment} from './schema';
import {stripePaymentEvents} from './stripe-events-schema';
import {StripeClient,stripeConfiguration,verifiedStripeState} from '@/lib/stripe';
import {lockProject} from './project-lifecycle';
import {markPaymentPaid,PaymentConflictError,PaymentAccessError} from './payments';

export async function getOwnedStripePayment(sessionId:string,userId:string){
 const {environment}=stripeConfiguration();
 const [row]=await db.select({payment:payments,project:projects}).from(payments).innerJoin(projects,eq(projects.id,payments.projectId)).where(and(eq(payments.provider,'stripe'),eq(payments.environment,environment),eq(payments.providerOrderId,sessionId),eq(payments.userId,userId),eq(projects.clientId,userId))).limit(1);
 if(!row||['commerce','subscription'].includes(row.project.industry))throw new PaymentAccessError();return row.payment;
}
export async function stripeEventPayment(sessionId:string,intentId:string,paymentId?:string){
 const {environment}=stripeConfiguration();
 const [row]=await db.select().from(payments).where(and(eq(payments.provider,'stripe'),eq(payments.environment,environment),or(eq(payments.providerOrderId,sessionId),eq(payments.providerCaptureId,intentId),...(paymentId?[eq(payments.id,paymentId)]:[])))).limit(1);return row;
}
export async function reconcileStripePayment(payment:Payment,event?:{id:string;type:string;created:number}){
 if(payment.provider!=='stripe'||!payment.providerOrderId)throw new PaymentConflictError('PAYMENT_NOT_ATTACHED');
 const config=stripeConfiguration();if(payment.environment!==config.environment)throw new PaymentAccessError();
 // Serialize provider observations for this project. Payment, progress and
 // technical event either commit together or all roll back for a safe retry.
 return db.transaction(async tx=>{
  await lockProject(tx,payment.projectId);
  const [current]=await tx.select().from(payments).where(eq(payments.id,payment.id)).for('update');
  if(!current||current.provider!=='stripe'||current.environment!==payment.environment||current.attempt!==payment.attempt||current.providerOrderId!==payment.providerOrderId)throw new PaymentConflictError('PAYMENT_CHANGED');
  const session=await new StripeClient().get(current.providerOrderId!);
  const state=verifiedStripeState(session,current);
  if(state.state==='paid')await markPaymentPaid(current,state.captureId,tx);
  if(state.state==='refunded'||state.state==='held')await tx.update(payments).set({status:'failed',failureCode:state.state==='held'?'STRIPE_DISPUTED':state.refundedCents===current.amountCents?'STRIPE_REFUNDED':'STRIPE_PARTIALLY_REFUNDED',providerCaptureId:state.captureId,captureStartedAt:new Date(),updatedAt:new Date()}).where(eq(payments.id,current.id));
  if(state.state==='expired'&&current.status==='pending'&&!current.captureStartedAt)await tx.update(payments).set({status:'failed',failureCode:'STRIPE_EXPIRED',updatedAt:new Date()}).where(eq(payments.id,current.id));
  const record=event??{id:`reconcile:${payment.id}:${payment.attempt}:${state.state}:${state.refundedCents}`,type:'manual.reconcile',created:Math.floor(Date.now()/1000)};
  await tx.insert(stripePaymentEvents).values({environment:payment.environment,eventId:record.id,paymentId:payment.id,eventType:record.type,sessionId:payment.providerOrderId!,intentId:'captureId' in state?state.captureId:null,attempt:payment.attempt,amountCents:payment.amountCents,currency:payment.currency,financialState:state.state,refundedCents:state.refundedCents,providerCreatedAt:new Date(record.created*1000)}).onConflictDoNothing();
  const [updated]=await tx.select({status:payments.status}).from(payments).where(eq(payments.id,current.id));
  return updated.status;
 });
}
