CREATE TABLE "stripe_payment_events" (
	"environment" text NOT NULL,
	"event_id" text NOT NULL,
	"payment_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"session_id" text NOT NULL,
	"intent_id" text,
	"attempt" integer NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text NOT NULL,
	"financial_state" text NOT NULL,
	"refunded_cents" integer DEFAULT 0 NOT NULL,
	"provider_created_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stripe_payment_events_environment_event_id_pk" PRIMARY KEY("environment","event_id"),
	CONSTRAINT "stripe_events_environment_check" CHECK ("stripe_payment_events"."environment" IN ('sandbox','live')),
	CONSTRAINT "stripe_events_attempt_check" CHECK ("stripe_payment_events"."attempt" > 0),
	CONSTRAINT "stripe_events_amount_check" CHECK ("stripe_payment_events"."amount_cents" > 0),
	CONSTRAINT "stripe_events_currency_check" CHECK ("stripe_payment_events"."currency" = 'EUR'),
	CONSTRAINT "stripe_events_state_check" CHECK ("stripe_payment_events"."financial_state" IN ('pending','paid','expired','refunded','held')),
	CONSTRAINT "stripe_events_refund_check" CHECK ("stripe_payment_events"."refunded_cents" >= 0 AND "stripe_payment_events"."refunded_cents" <= "stripe_payment_events"."amount_cents")
);

--> statement-breakpoint
ALTER TABLE "stripe_payment_events" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "stripe_payment_events" ADD CONSTRAINT "stripe_payment_events_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
REVOKE ALL ON TABLE public.stripe_payment_events FROM PUBLIC;
--> statement-breakpoint
DO $$ BEGIN
 IF EXISTS (SELECT FROM pg_roles WHERE rolname='anon') THEN REVOKE ALL ON TABLE public.stripe_payment_events FROM anon; END IF;
 IF EXISTS (SELECT FROM pg_roles WHERE rolname='authenticated') THEN REVOKE ALL ON TABLE public.stripe_payment_events FROM authenticated; END IF;
END $$;
-- Runtime grants/policies require a proven role; none is guessed here.
