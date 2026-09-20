/**
 * Signup policy switch.
 *
 * Email confirmation is only useful once Resend can actually deliver to
 * strangers, which requires a verified sending domain. Until that domain
 * exists, `REQUIRE_EMAIL_VERIFICATION=false` lets people register and sign in
 * straight away: the account is still written to the database exactly as
 * before, it is simply marked as confirmed on creation.
 *
 * Flip the variable to `true` (or delete it) after verifying a domain in
 * Resend — no code changes needed, and accounts created while it was off keep
 * working because they already carry an `email_verified` timestamp.
 */
export const requireEmailVerification =
  process.env.REQUIRE_EMAIL_VERIFICATION !== "false";

