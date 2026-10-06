# Platform tools deployment and acceptance

## Production prerequisites

In the Blue Sass Vercel project, ensure Production contains `DATABASE_URL`,
`AUTH_SECRET`, `PLATFORM_OWNER_EMAIL`, and the existing mail and PayPal settings.
Keep values in Vercel environment settings; do not copy them into this document.
The owner account is `aak.geneltek@gmail.com` and must already exist with a
verified email or a linked verified Google login.

`npm run build` runs the additive platform-tools migration. It refuses to
deploy the new authorization system if the designated verified owner cannot
be found. Existing owner identity is never overwritten by the migration.
Existing projects, subscription agreements and prices are preserved.

## Acceptance after deployment

1. Wait for the deployment of the new commit to show Ready in Vercel, then
   open the production domain in a fresh tab.
2. Sign in as the owner and open `/ar/admin/team`. Confirm account controls,
   granular permission options, project assignment and the activity log.
3. Grant an employee only assigned-project access. Confirm they cannot open
   the team controls or another client's unassigned project. Revoking access
   must remove it on their next request.
4. Open `/ar/audit`. Review an owned public URL and a small source project.
   Confirm saved results, recommendations and report printing. Source is
   analyzed without executing it; only results and file names are stored.
5. Create an unpaid test project. Approve its price and scope in management,
   accept the current offer as its client, then inspect the next installment.
   Changing the unpaid offer must invalidate previous acceptance. Do not
   execute a real transaction as part of this check.
6. Send a project review request and answer it as the client. Extra price and
   delivery impact are recorded for review; acceptance does not collect funds
   or rewrite a payment schedule already in progress.
7. Check home, services, subscriptions and audit pages on phone and desktop.
   New tool access lasts 30 days after a completed Live payment, with manual
   renewal. Sandbox payments do not activate a paid production entitlement.

## Current limits

The source review accepts up to 500 supported source files and 3 MB total.
Website review inspects one page and up to three same-origin link responses.
It does not execute uploaded code, perform penetration tests, inspect a
private database or promise a complete vulnerability assessment.
Hosting capacity expansion remains deferred by the owner.

When the Vercel connector returns a team authorization error, reconnect it
with access to the `genel-tek` team. A Git push can still trigger an existing
Vercel Git deployment; confirm its Ready status before claiming publication.
