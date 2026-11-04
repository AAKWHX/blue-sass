import {pgTable,text,uuid,integer,timestamp,primaryKey,check} from 'drizzle-orm/pg-core';
import {sql} from 'drizzle-orm';
import {payments} from './schema';

// Separate from the existing schema: PayPal must keep working before this
// proposed, independently approved migration is applied.
export const stripePaymentEvents=pgTable('stripe_payment_events',{
 environment:text('environment').notNull(),eventId:text('event_id').notNull(),paymentId:uuid('payment_id').notNull().references(()=>payments.id,{onDelete:'restrict'}),eventType:text('event_type').notNull(),sessionId:text('session_id').notNull(),intentId:text('intent_id'),attempt:integer('attempt').notNull(),amountCents:integer('amount_cents').notNull(),currency:text('currency').notNull(),financialState:text('financial_state').notNull(),refundedCents:integer('refunded_cents').notNull().default(0),providerCreatedAt:timestamp('provider_created_at',{withTimezone:true}).notNull(),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[
 primaryKey({columns:[t.environment,t.eventId]}),
 check('stripe_events_environment_check',sql`${t.environment} IN ('sandbox','live')`),
 check('stripe_events_attempt_check',sql`${t.attempt} > 0`),
 check('stripe_events_amount_check',sql`${t.amountCents} > 0`),
 check('stripe_events_currency_check',sql`${t.currency} = 'EUR'`),
 check('stripe_events_state_check',sql`${t.financialState} IN ('pending','paid','expired','refunded','held')`),
 check('stripe_events_refund_check',sql`${t.refundedCents} >= 0 AND ${t.refundedCents} <= ${t.amountCents}`),
]).enableRLS();
