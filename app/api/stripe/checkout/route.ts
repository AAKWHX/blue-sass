import {NextResponse} from 'next/server';
import {z} from 'zod';
import {assertSameOrigin} from '@/lib/api-security';
import {assertCanWrite,requireViewer} from '@/lib/db/access';
import {attachPayPalOrder,prepareProviderPayment} from '@/lib/db/payments';
import {db} from '@/lib/db';
import {stripePaymentEvents} from '@/lib/db/stripe-events-schema';
import {StripeClient,checkoutUrl,stripeConfiguration,verifiedStripeState} from '@/lib/stripe';
import {reconcileStripePayment} from '@/lib/db/stripe-payments';
import {stripeError} from '@/lib/stripe-errors';
import {readBoundedText} from '@/lib/request-body';
import {takeRateLimit} from '@/lib/rate-limit';
export const runtime='nodejs';
const input=z.object({projectId:z.string().uuid(),locale:z.enum(['ar','en','nl'])}).strict();
export async function POST(request:Request){
 try{
  assertSameOrigin(request);const viewer=await requireViewer();assertCanWrite(viewer);
  if(!await takeRateLimit(`stripe-create:${viewer.id}`,10,60000))return NextResponse.json({error:'RATE_LIMITED'},{status:429});
  const body=input.parse(JSON.parse(await readBoundedText(request,1024)));stripeConfiguration(true);
  await db.select({id:stripePaymentEvents.eventId}).from(stripePaymentEvents).limit(1);
  const prepared=await prepareProviderPayment(body.projectId,viewer.id,'stripe');
  const client=new StripeClient();
  const session=prepared.payment.providerOrderId?await client.get(prepared.payment.providerOrderId):await client.create({...prepared.payment,locale:body.locale});
  verifiedStripeState(session,{...prepared.payment,providerOrderId:session.id});
  if(!prepared.payment.providerOrderId)await attachPayPalOrder(prepared.payment,session.id);
  if(session.status!=='open'){
   const status=await reconcileStripePayment({...prepared.payment,providerOrderId:session.id});
   return NextResponse.json({status},{headers:{'Cache-Control':'no-store'}});
  }
  return NextResponse.json({url:checkoutUrl(session.url)},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch(error){
  // Keep the reservation on ambiguous network failures; reuse its idempotency
  // key because the provider might already have created a session.
  return stripeError(error);
 }
}
