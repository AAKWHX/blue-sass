/**
 * Signup policy switch.
 *
 * Production always requires proof of email ownership for new accounts.
 * Only local development may explicitly opt out. Existing verification
 * timestamps are preserved; historical identity review is a separate task.
 */
export const requireEmailVerification =
  process.env.NODE_ENV === "production" || process.env.REQUIRE_EMAIL_VERIFICATION !== "false";
