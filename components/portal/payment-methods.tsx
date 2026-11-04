"use client";
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {PayPalCheckout} from './paypal-checkout';
import {paymentCopy} from '@/lib/i18n/payment-copy';
import {paymentMethodsCopy} from '@/lib/i18n/payment-methods';
import type {ActiveLocale} from '@/lib/i18n/config';

export function PaymentMethods({locale,projectId,paypal,stripe,stripeReconcile=stripe,clientId,currency,initialStatus,initialOrderId,initialProvider}:{locale:ActiveLocale;projectId:string;paypal:boolean;stripe:boolean;stripeReconcile?:boolean;clientId:string;currency:string;initialStatus:'idle'|'pending'|'failed';initialOrderId?:string;initialProvider?:string}){
 const router=useRouter(),c=paymentMethodsCopy(locale);
 const [selected,setSelected]=useState<'stripe'|'paypal'|null>(initialStatus==='pending'&&initialProvider==='paypal'?'paypal':null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(false);
 const held=initialStatus==='pending'?initialProvider:null;
 async function stripeRequest(operation:'checkout'|'reconcile'|'cancel'='checkout'){
  if(busy)return;setBusy(true);setError(false);
  try{
   const response=await fetch(operation!=='checkout'&&initialOrderId?`/api/stripe/sessions/${encodeURIComponent(initialOrderId)}/${operation}`:'/api/stripe/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:operation!=='checkout'?undefined:JSON.stringify({projectId,locale})});
   const body=await response.json();
   if(!response.ok)throw new Error('UNAVAILABLE');
   if(typeof body.url==='string'){
    const url=new URL(body.url);if(url.protocol!=='https:'||url.hostname!=='checkout.stripe.com'||url.username||url.password||url.port)throw new Error('UNAVAILABLE');
    window.location.assign(url.href);return;
   }
   router.refresh();
  }catch{setError(true);}finally{setBusy(false);}
 }
 return <div className="space-y-5">
  {held?<p role="status" className="text-sm leading-7">{c.pending}</p>:null}
  <div className="grid gap-3 sm:grid-cols-2">
   <Button type="button" variant="outline" disabled={!stripe||busy||held==='paypal'} onClick={()=>void stripeRequest()}>{busy?c.processing:c.stripe}</Button>
   <Button type="button" variant="outline" disabled={!paypal||busy||held==='stripe'} aria-pressed={selected==='paypal'} onClick={()=>setSelected('paypal')}>{c.paypal}</Button>
  </div>
  {held==='stripe'&&initialOrderId&&stripeReconcile?<div className="flex flex-col gap-3"><Button type="button" variant="outline" className="h-auto min-h-11 whitespace-normal" disabled={busy} onClick={()=>void stripeRequest('reconcile')}>{c.check}</Button><Button type="button" variant="outline" className="h-auto min-h-11 whitespace-normal" disabled={busy} onClick={()=>void stripeRequest('cancel')}>{c.cancel}</Button></div>:null}
  {selected==='paypal'&&paypal&&held!=='stripe'?<PayPalCheckout projectId={projectId} clientId={clientId} currency={currency} copy={paymentCopy[locale]} initialStatus={initialStatus} initialOrderId={initialProvider==='paypal'?initialOrderId:undefined}/>:null}
  {!stripe&&!paypal?<p role="status">{c.unavailable}</p>:null}
  {error?<p role="alert" className="text-sm leading-7">{c.error}</p>:null}
 </div>;
}
