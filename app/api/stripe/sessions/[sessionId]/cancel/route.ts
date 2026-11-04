import {NextResponse} from 'next/server';
import {assertSameOrigin} from '@/lib/api-security';
import {assertCanWrite,requireViewer} from '@/lib/db/access';
import {getOwnedStripePayment,reconcileStripePayment} from '@/lib/db/stripe-payments';
import {StripeClient,verifiedStripeState} from '@/lib/stripe';
import {stripeError} from '@/lib/stripe-errors';
import {takeRateLimit} from '@/lib/rate-limit';
export async function POST(request:Request,{params}:{params:Promise<{sessionId:string}>}){
 try{
  assertSameOrigin(request);const viewer=await requireViewer();assertCanWrite(viewer);
  if(!await takeRateLimit(`stripe-cancel:${viewer.id}`,10,60000))return NextResponse.json({error:'RATE_LIMITED'},{status:429});
  const {sessionId}=await params;if(!/^cs_(?:test|live)_[A-Za-z0-9]+$/.test(sessionId))return NextResponse.json({error:'INVALID_REQUEST'},{status:400});
  const payment=await getOwnedStripePayment(sessionId,viewer.id),client=new StripeClient();
  const current=await client.get(sessionId);
  verifiedStripeState(current,payment);
  if(current.status==='open'){
   // Expire at the provider; returning from Checkout alone cannot release a slot.
   // A concurrent completion is resolved by retrieving authoritative state below.
   try{await client.request(`checkout/sessions/${encodeURIComponent(sessionId)}/expire`,new URLSearchParams(),`expire:${payment.id}:${payment.attempt}`);}catch{/* Reconcile even if completion raced with expiry. */}
  }
  const status=await reconcileStripePayment(payment);return NextResponse.json({status},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return stripeError(error);}
}
