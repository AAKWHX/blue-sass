# Blue Sass implementation phases

Approved scope: preserve hosting, subscriptions use working automated features only,
jobs run 30 days, marketplace starts with listings/offers (no custody or payouts),
products support Blue Sass and moderated user listings. Email-domain checks were
cancelled by the user; passive message content analysis remains.

## 1. Reliability and security — in progress
- Shared authentication limits, password breach checks, payment reconciliation: local changes under verification.
- Require an affected database row before reporting profile/review save success.
- Finish payment concurrency checks and production verification before release.

## 2. Tools — in progress
- Reuse existing scanner, SSRF protection, reports and cost configurator.
- Passive message analysis core and localized browser-only UI added at `/[locale]/tools/message-checker`.
- Tools directory and initial ten tools are implemented; domain checks are cancelled.
- Build directory, localized tool pages, QR and invoice tools.
- AI tools must remain unavailable without a configured provider, never simulate output.

## 3. Interface and subscriptions — pending
- Gold homepage product cards; Arabic font; admin/quotes layout; interactive previews.
- Automated plan entitlements only, no promised staff hours.
- Verify saved settings and moderation through authenticated browser workflows.

## 4. Commercial listings — pending
- Jobs, project offers and moderated digital products.
- Do not activate seller payouts until an appropriate payout integration is implemented.

## 5. Advertising and release — pending
- Single AdSense integration, public free-content eligibility, consent setup,
  exclusion of accounts/admin/auth/checkout and paid users.
- Typecheck, lint, tests, production build, responsive/auth checks before deployment.

This file records work status, not a claim that pending features are available.
