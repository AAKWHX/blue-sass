import test from 'node:test';import assert from 'node:assert/strict';import {createHmac} from 'node:crypto';import {load} from './test-typescript-loader.mjs';
const {verifyStripeSignature,verifiedStripeState,checkoutUrl,StripeClient,stripeClientAvailable,stripeSettlementAvailable}=load('lib/stripe.ts');
const payment={id:'00000000-0000-4000-8000-000000000001',providerOrderId:'cs_test_local',attempt:2,billingStage:'planning',amountCents:1234,currency:'EUR',environment:'sandbox'};
const paid=()=>({id:payment.providerOrderId,livemode:false,mode:'payment',status:'complete',payment_status:'paid',client_reference_id:payment.id,amount_total:1234,currency:'eur',metadata:{blue_sass_payment:payment.id,attempt:'2',stage:'planning'},payment_intent:{id:'pi_local',status:'succeeded',amount:1234,amount_received:1234,currency:'eur',latest_charge:{id:'ch_local',amount:1234,currency:'eur',amount_refunded:0,paid:true,disputed:false}}});
test('Stripe signatures cover exact raw UTF-8, key rotation and bounded timestamp',()=>{
 const raw=' {"text":"اختبار"} ',secret='whsec_synthetic_only',now=1800000000;
 const sign=(body,time=now)=>createHmac('sha256',secret).update(`${time}.${body}`).digest('hex');
 assert.equal(verifyStripeSignature(raw,`t=${now},v1=${'0'.repeat(64)},v1=${sign(raw)}`,secret,now),true);
 for(const [body,header] of [[raw.trim(),`t=${now},v1=${sign(raw)}`],[raw,`t=${now-301},v1=${sign(raw,now-301)}`],[raw,`t=${now+301},v1=${sign(raw,now+301)}`],[raw,`t=${now},t=${now},v1=${sign(raw)}`],[raw,'t=x,v1=invalid']])assert.equal(verifyStripeSignature(body,header,secret,now),false);
});
test('Stripe settlement requires matching financial identity and completed provider state',()=>{
 assert.equal(verifiedStripeState(paid(),payment).state,'paid');
 for(const mutate of [s=>s.id='cs_test_other',s=>s.livemode=true,s=>s.amount_total=1,s=>s.currency='usd',s=>s.client_reference_id='other',s=>s.metadata.attempt='1',s=>s.metadata.stage='design',s=>s.metadata.blue_sass_payment='other',s=>s.payment_intent.amount=1,s=>s.payment_intent.latest_charge.amount_refunded=9999]){const s=paid();mutate(s);assert.throws(()=>verifiedStripeState(s,payment));}
 const delayed=paid();delayed.payment_status='unpaid';assert.equal(verifiedStripeState(delayed,payment).state,'pending');
});
test('Stripe refund and dispute override completion; unsafe expiration never releases a slot',()=>{
 const s=paid();s.payment_intent.latest_charge.amount_refunded=100;assert.equal(verifiedStripeState(s,payment).state,'refunded');s.payment_intent.latest_charge.disputed=true;assert.equal(verifiedStripeState(s,payment).state,'held');
 s.status='expired';s.payment_status='unpaid';s.payment_intent={...s.payment_intent,latest_charge:null,status:'processing'};assert.equal(verifiedStripeState(s,payment).state,'pending');s.payment_intent.status='canceled';assert.equal(verifiedStripeState(s,payment).state,'expired');
});
test('Stripe redirects allow only the hosted checkout origin',()=>{
 assert.equal(checkoutUrl('https://checkout.stripe.com/c/pay/local'),'https://checkout.stripe.com/c/pay/local');for(const url of ['https://checkout.stripe.com.evil.invalid/a','javascript:alert(1)','https://user@checkout.stripe.com/a','http://checkout.stripe.com/a'])assert.throws(()=>checkoutUrl(url));
});
test('Stripe is opt-in and rejects mismatched test/live settings',()=>{
 delete process.env.STRIPE_PAYMENTS_ENABLED;assert.equal(stripeClientAvailable(),false);
 Object.assign(process.env,{STRIPE_PAYMENTS_ENABLED:'true',STRIPE_ENV:'test',STRIPE_SECRET_KEY:'rk_test_synthetic_local_only',STRIPE_WEBHOOK_SECRET:'whsec_synthetic_local_only',STRIPE_RETURN_ORIGIN:'https://example.invalid',PAYPAL_ENV:'live'});assert.equal(stripeClientAvailable(),false);process.env.PAYPAL_ENV='sandbox';assert.equal(stripeClientAvailable(),true);delete process.env.STRIPE_PAYMENTS_ENABLED;
});
test('Stripe request retries retain identical parameters and key across a locale switch',async()=>{
 Object.assign(process.env,{STRIPE_PAYMENTS_ENABLED:'true',STRIPE_ENV:'test',STRIPE_SECRET_KEY:'rk_test_synthetic_local_only',STRIPE_WEBHOOK_SECRET:'whsec_synthetic_local_only',STRIPE_RETURN_ORIGIN:'https://example.invalid',PAYPAL_ENV:'sandbox'});
 const native=globalThis.fetch,calls=[];globalThis.fetch=async(url,init)=>{assert.equal(new URL(url).origin,'https://api.stripe.com');calls.push(init);return new Response(JSON.stringify({...paid(),status:'open',payment_status:'unpaid',payment_intent:null,url:'https://checkout.stripe.com/c/pay/local'}));};
 try{const client=new StripeClient(),input={...payment,projectId:'00000000-0000-4000-8000-000000000002',locale:'ar',updatedAt:new Date('2026-10-22T00:00:00Z')};await client.create(input);await client.create({...input,locale:'nl'});assert.equal(calls[0].body,calls[1].body);assert.equal(calls[0].headers['Idempotency-Key'],calls[1].headers['Idempotency-Key']);assert.ok(!new URLSearchParams(calls[0].body).has('payment_method_types'));}finally{globalThis.fetch=native;delete process.env.STRIPE_PAYMENTS_ENABLED;}
});
test('disabling new Stripe checkouts preserves settlement configuration and blocks creation',async()=>{
 Object.assign(process.env,{STRIPE_ENV:'test',STRIPE_SECRET_KEY:'rk_test_synthetic_local_only',STRIPE_WEBHOOK_SECRET:'whsec_synthetic_local_only',STRIPE_RETURN_ORIGIN:'https://example.invalid',PAYPAL_ENV:'sandbox'});delete process.env.STRIPE_PAYMENTS_ENABLED;
 assert.equal(stripeClientAvailable(),false);assert.equal(stripeSettlementAvailable(),true);
 await assert.rejects(()=>new StripeClient().create({...payment,projectId:payment.id,locale:'ar',updatedAt:new Date()}));
});
