import {NextResponse} from 'next/server';
import {z} from 'zod';
import {AuthorisationError} from '@/lib/db/access';
import {PaymentAccessError,PaymentConflictError} from '@/lib/db/payments';
import {StripeUnavailable,StripeProviderError} from '@/lib/stripe';
export function stripeError(error:unknown){
 const response=(code:string,status:number)=>NextResponse.json({error:code},{status,headers:{'Cache-Control':'no-store'}});
 if(error instanceof AuthorisationError)return response('ACCESS_DENIED',403);
 if(error instanceof PaymentAccessError)return response('PAYMENT_UNAVAILABLE',403);
 if(error instanceof PaymentConflictError)return response('PAYMENT_CONFLICT',409);
 if(error instanceof StripeUnavailable)return response('STRIPE_NOT_CONFIGURED',503);
 if(error instanceof StripeProviderError)return response('STRIPE_UNAVAILABLE',502);
 if(error instanceof SyntaxError||error instanceof z.ZodError)return response('INVALID_REQUEST',400);
 if(error instanceof Error&&error.message==='UNTRUSTED_ORIGIN')return response('INVALID_ORIGIN',403);
 if(error instanceof Error&&error.message==='BODY_TOO_LARGE')return response('INVALID_REQUEST',413);
 return response('PAYMENT_UNAVAILABLE',503);
}
