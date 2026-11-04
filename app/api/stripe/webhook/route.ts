import {NextResponse} from 'next/server';
import {z} from 'zod';
import {StripeClient,stripeConfiguration,verifyStripeSignature} from '@/lib/stripe';
import {stripeEventPayment,reconcileStripePayment} from '@/lib/db/stripe-payments';
import {readBoundedText} from '@/lib/request-body';
import {takeRateLimit,requestIdentity} from '@/lib/rate-limit';
export const runtime='nodejs';export const maxDuration=60;
const eventSchema=z.object({id:z.string().regex(/^evt_[A-Za-z0-9]+$/),type:z.string().max(100),created:z.number().int().nonnegative(),livemode:z.boolean(),data:z.object({object:z.object({id:z.string(),payment_intent:z.union([z.string(),z.object({id:z.string()})]).nullable().optional(),metadata:z.record(z.string(),z.string()).optional()})})});
const handled=new Set(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired','charge.refunded','charge.dispute.created','charge.dispute.closed','payment_intent.succeeded','payment_intent.payment_failed']);
export async function POST(request:Request){
 try{
  const signature=request.headers.get('stripe-signature');if(!signature)return NextResponse.json({error:'INVALID_SIGNATURE'},{status:401});
  if(!await takeRateLimit(`stripe-webhook:${requestIdentity(request.headers)}`,30,60000)||!await takeRateLimit('stripe-webhook:global',120,60000))return NextResponse.json({error:'WEBHOOK_BUSY'},{status:503});
  const config=stripeConfiguration(),raw=await readBoundedText(request,64000);
  if(!verifyStripeSignature(raw,signature,config.webhook))return NextResponse.json({error:'INVALID_SIGNATURE'},{status:401});
  const event=eventSchema.parse(JSON.parse(raw));if(event.livemode!==config.live)return NextResponse.json({error:'INVALID_ENVIRONMENT'},{status:400});
  if(handled.has(event.type)){
   const object=event.data.object,sessionId=object.id.startsWith('cs_')?object.id:'',intentId=object.id.startsWith('pi_')?object.id:typeof object.payment_intent==='string'?object.payment_intent:object.payment_intent?.id??'';
   const candidate=object.metadata?.blue_sass_payment;const paymentId=z.string().uuid().safeParse(candidate).success?candidate:undefined;
   let payment=await stripeEventPayment(sessionId,intentId,paymentId);
   if(!payment&&/^pi_[A-Za-z0-9]+$/.test(intentId)){
    // A refund/dispute may arrive before the session-completed event has
    // populated provider_capture_id. Resolve the signed trigger via provider metadata.
    const intent=await new StripeClient().request(`payment_intents/${encodeURIComponent(intentId)}`);
    const metadata=z.object({metadata:z.object({blue_sass_payment:z.string().uuid()})}).safeParse(intent);
    if(metadata.success)payment=await stripeEventPayment('',intentId,metadata.data.metadata.blue_sass_payment);
   }
   if(payment)await reconcileStripePayment(payment,event);
  }
  return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'WEBHOOK_UNAVAILABLE'},{status:503});}
}
