# Blue Sass security review — 2026-10-06

This is a bounded code and configuration review, not a penetration-test certification or a guarantee that no vulnerabilities exist.

## Changes

- Next.js and its ESLint configuration patched from 16.3.4 to 16.3.8. TypeScript remains 5.9 and ESLint remains 9.
- Compatible brace-expansion patches pinned for development tools.
- Database connection and access modules explicitly marked server-only.
- Direct credentials-provider login limited to ten attempts per email digest per fifteen minutes; bounded input sizes and limiter storage.
- Session locale updates validated against the fifteen supported locales.
- Profile language saves also update the non-sensitive locale preference cookie.
- PayPal capture validation requires the completed capture's own currency and amount; no fallback to the purchase-unit amount.
- Added same-origin, rate-limit and capture regression tests.
- Disabled the framework identification header and added CSP restrictions on base URLs, embedded objects and framing. Existing anti-framing, nosniff and referrer headers retained.

## Verified locally

- Production dependency audit: zero known advisories after the patches.
- 33 automated tests passed, including project ownership/stage policy, safe return URLs, price configuration, installment allocation and payment validation.
- TypeScript, lint and production build passed during this review; final interface build is verified before deployment.
- Pattern scan of application code and public assets found no private-key blocks, recognizable AWS/GitHub tokens or credential-bearing PostgreSQL URLs. Client build scan found no database URL, PayPal secret, auth secret or password-hash identifiers. These pattern checks cannot detect every possible secret.
- Existing authorized production test request was saved and edited, its EUR 156 final price approved, its first EUR 15.60 installment displayed with later stages blocked, and the request cancelled. No payment submitted and no real capture or settlement verified.

## Remaining limitations

- Full dependency audit still reports nine development-tool findings: five high and four moderate, propagated from braces and legacy esbuild dependency chains. Current npm recommendations include incompatible downgrades. These packages are not production runtime dependencies; do not expose development servers or Drizzle Studio publicly, and track compatible upstream fixes.
- Attempt limiting is an in-memory backstop, not a distributed multi-region limiter. A shared limiter or platform firewall policy is needed for stronger sustained-abuse protection.
- CSP does not yet restrict every script source. A strict nonce-based policy needs a separate compatibility review with Next.js, authentication and PayPal.
- PayPal live settlement requires a separately authorized real transaction and confirmation in the recipient account. It was not performed.
- No claim is made about compromise history, secret rotation, all cloud configuration, third-party services or a full independent penetration test.
- Hosting capacity expansion remains deferred at the user's request.

## Localization

Eight additional static translation catalogs contain 836 shared UI phrases each, preserving placeholders and structural delimiters. All fifteen locale routes build. Machine-assisted translations need native-speaker proofreading, especially legal and commercial copy. Customer-entered text and illustrative template content are not automatically translated.
