import 'server-only';
import { assertQaRuntimeApproved } from './db/qa-local-guard.mjs';
// Keep the runtime lock intact without declaring subsequent provider code unreachable.
function ensureQaProviderAllowed(): void { assertQaRuntimeApproved(); }
import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { getPayPalEnvironment } from '@/lib/paypal';
import { readBoundedText } from '@/lib/request-body';

export class StripeUnavailable extends Error { constructor(){super('STRIPE_UNAVAILABLE');} }
export class StripeProviderError extends Error { constructor(){super('STRIPE_PROVIDER_UNAVAILABLE');} }
export function stripeConfiguration(forCheckout=false) {
 const mode=process.env.STRIPE_ENV;
 const key=process.env.STRIPE_SECRET_KEY?.trim()??'';
 const webhook=process.env.STRIPE_WEBHOOK_SECRET?.trim()??'';
 if((forCheckout&&process.env.STRIPE_PAYMENTS_ENABLED!=='true')||!['test','live'].includes(mode??'')||!key.startsWith(mode==='live'?'rk_live_':'rk_test_')||!webhook.startsWith('whsec_'))throw new StripeUnavailable();
 const environment=mode==='live'?'live':'sandbox';
 // Both providers must share the same financial slot and test/live boundary.
 if(environment!==getPayPalEnvironment())throw new StripeUnavailable();
 let origin:URL;try{origin=new URL(process.env.STRIPE_RETURN_ORIGIN??'');}catch{throw new StripeUnavailable();}
 if(origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash||(origin.protocol!=='https:'&&!(process.env.NODE_ENV!=='production'&&origin.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(origin.hostname))))throw new StripeUnavailable();
 return {key,webhook,environment,live:mode==='live',origin:origin.origin};
}
export function stripeClientAvailable(){try{ensureQaProviderAllowed();stripeConfiguration(true);return true;}catch{return false;}}
export function stripeSettlementAvailable(){try{ensureQaProviderAllowed();stripeConfiguration();return true;}catch{return false;}}

const intentSchema=z.object({id:z.string(),status:z.string(),amount:z.number().int(),amount_received:z.number().int(),currency:z.string(),latest_charge:z.object({id:z.string(),paid:z.boolean(),amount:z.number().int(),currency:z.string(),amount_refunded:z.number().int().nonnegative(),disputed:z.boolean().optional()}).nullable()});
export const stripeSessionSchema=z.object({id:z.string(),livemode:z.boolean(),mode:z.string(),status:z.enum(['open','complete','expired']),payment_status:z.string(),client_reference_id:z.string().nullable(),amount_total:z.number().int().nullable(),currency:z.string().nullable(),metadata:z.record(z.string(),z.string()).nullable(),payment_intent:z.union([z.string(),intentSchema]).nullable(),url:z.string().nullable().optional()});
export type StripeSession=z.infer<typeof stripeSessionSchema>;

/** Instance-scoped REST client: fixed host/version, no SDK or new dependency. */
export class StripeClient {
 private readonly config=stripeConfiguration();
 async request(resource:string,form?:URLSearchParams,idempotency?:string){
  ensureQaProviderAllowed();
  let response:Response;
  try{response=await fetch('https://api.stripe.com/v1/'+resource,{method:form?'POST':'GET',headers:{Authorization:`Bearer ${this.config.key}`,'Stripe-Version':'2026-08-26.dahlia',...(form?{'Content-Type':'application/x-www-form-urlencoded'}:{}),...(idempotency?{'Idempotency-Key':idempotency}:{})},body:form?.toString(),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});}catch{throw new StripeProviderError();}
  if(!response.ok)throw new StripeProviderError();
  try{return JSON.parse(await readBoundedText(response,256_000)) as unknown;}catch{throw new StripeProviderError();}
 }
 async create(input:{id:string;attempt:number;billingStage:string;amountCents:number;currency:string;projectId:string;locale:string;updatedAt:Date}){
  stripeConfiguration(true);
  // Locale-neutral return uses the existing locale cookie/header redirect.
  // A locale switch must not alter parameters under the same idempotency key.
  const back=`${this.config.origin}/portal/projects/${input.projectId}/payment`;
  const form=new URLSearchParams({mode:'payment',success_url:back,cancel_url:back,client_reference_id:input.id,'line_items[0][quantity]':'1','line_items[0][price_data][currency]':input.currency.toLowerCase(),'line_items[0][price_data][unit_amount]':String(input.amountCents),'line_items[0][price_data][product_data][name]':`Blue Sass · ${input.billingStage}`,'metadata[blue_sass_payment]':input.id,'metadata[attempt]':String(input.attempt),'metadata[stage]':input.billingStage,integration_identifier:'blue_sass_installments_kqmvtxra',expires_at:String(Math.floor(input.updatedAt.getTime()/1000)+3600)});
  // No automatic taxes, discounts or client amounts. Currency and total are fixed.
  form.set('payment_intent_data[metadata][blue_sass_payment]',input.id);
  form.set('payment_intent_data[metadata][attempt]',String(input.attempt));
  const session=stripeSessionSchema.parse(await this.request('checkout/sessions',form,`bs:${input.id}:${input.attempt}`));
  if(!session.id.startsWith(this.config.live?'cs_live_':'cs_test_')||session.livemode!==this.config.live)throw new StripeProviderError();
  return session;
 }
 async get(sessionId:string){
  if(!/^cs_(?:test|live)_[A-Za-z0-9]+$/.test(sessionId))throw new StripeProviderError();
  return stripeSessionSchema.parse(await this.request(`checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=payment_intent.latest_charge`));
 }
}
export function checkoutUrl(value:unknown){
 if(typeof value!=='string')throw new StripeProviderError();let url:URL;try{url=new URL(value);}catch{throw new StripeProviderError();}
 if(url.protocol!=='https:'||url.hostname!=='checkout.stripe.com'||url.username||url.password||url.port)throw new StripeProviderError();return url.href;
}
export function verifyStripeSignature(raw:string,header:string|null,secret:string,now=Math.floor(Date.now()/1000)){
 if(!header||header.length>4096)return false;const parts=header.split(',');const times=parts.filter(p=>p.startsWith('t='));if(times.length!==1||!/^t=\d{1,12}$/.test(times[0]))return false;
 const timestamp=Number(times[0].slice(2));if(Math.abs(now-timestamp)>300)return false;
 const expected=createHmac('sha256',secret).update(`${timestamp}.${raw}`,'utf8').digest();
 return parts.filter(p=>/^v1=[a-f0-9]{64}$/.test(p)).some(p=>timingSafeEqual(expected,Buffer.from(p.slice(3),'hex')));
}

export function verifiedStripeState(session:StripeSession,payment:{id:string;providerOrderId:string|null;attempt:number;billingStage:string;amountCents:number;currency:string;environment:string}){
 if(session.id!==payment.providerOrderId||session.livemode!==(payment.environment==='live')||session.mode!=='payment'||session.client_reference_id!==payment.id||session.metadata?.blue_sass_payment!==payment.id||session.metadata.attempt!==String(payment.attempt)||session.metadata.stage!==payment.billingStage||session.amount_total!==payment.amountCents||session.currency!==payment.currency.toLowerCase())throw new StripeProviderError();
 const intent=session.payment_intent;
 if(intent&&typeof intent!=='string'){
  const charge=intent.latest_charge;
  if(intent.currency!==payment.currency.toLowerCase()||intent.amount!==payment.amountCents)throw new StripeProviderError();
  if(charge){
   if(charge.amount!==payment.amountCents||charge.currency!==payment.currency.toLowerCase()||charge.amount_refunded>payment.amountCents)throw new StripeProviderError();
   if(charge.disputed)return {state:'held' as const,captureId:intent.id,refundedCents:charge.amount_refunded};
   if(charge.amount_refunded>0)return {state:'refunded' as const,captureId:intent.id,refundedCents:charge.amount_refunded};
   if(session.payment_status==='paid'&&session.status==='complete'&&intent.status==='succeeded'&&intent.amount_received===payment.amountCents&&charge.paid)return {state:'paid' as const,captureId:intent.id,refundedCents:0};
  }
 }
 if(session.status==='expired'&&session.payment_status==='unpaid'&&(!intent||(typeof intent!=='string'&&['canceled','requires_payment_method'].includes(intent.status))))return {state:'expired' as const,refundedCents:0};
 return {state:'pending' as const,refundedCents:0};
}
