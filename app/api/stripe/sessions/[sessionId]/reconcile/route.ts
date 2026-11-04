import {NextResponse} from 'next/server';
import {assertSameOrigin} from '@/lib/api-security';
import {assertCanWrite,requireViewer} from '@/lib/db/access';
import {getOwnedStripePayment,reconcileStripePayment} from '@/lib/db/stripe-payments';
import {stripeError} from '@/lib/stripe-errors';
import {takeRateLimit} from '@/lib/rate-limit';
export async function POST(request:Request,{params}:{params:Promise<{sessionId:string}>}){
 try{assertSameOrigin(request);const viewer=await requireViewer();assertCanWrite(viewer);if(!await takeRateLimit(`stripe-reconcile:${viewer.id}`,20,60000))return NextResponse.json({error:'RATE_LIMITED'},{status:429});const {sessionId}=await params;
  if(!/^cs_(?:test|live)_[A-Za-z0-9]+$/.test(sessionId))return NextResponse.json({error:'INVALID_REQUEST'},{status:400});
  const payment=await getOwnedStripePayment(sessionId,viewer.id);const status=await reconcileStripePayment(payment);return NextResponse.json({status},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return stripeError(error);}
}
