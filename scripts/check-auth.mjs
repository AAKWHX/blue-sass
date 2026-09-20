// Read provider configuration and check one deliberately invalid login.
// Does not create users or complete OAuth. Never prints cookies or tokens.
import assert from "node:assert/strict";

const origin = process.env.AUTH_CHECK_ORIGIN || "https://www.bluesass.nl";
const providersResponse = await fetch(`${origin}/api/auth/providers`);
assert.equal(providersResponse.status, 200, "Provider endpoint must be healthy");
const providers = await providersResponse.json();
assert.ok(providers.google, "Google provider must be enabled");
assert.equal(providers.google.callbackUrl, `${origin}/api/auth/callback/google`);
console.log("PASS: Google is enabled with the canonical callback URL");

const csrfResponse = await fetch(`${origin}/api/auth/csrf`);
const { csrfToken } = await csrfResponse.json();
assert.ok(csrfToken, "CSRF token must be available");
const cookies = csrfResponse.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
const result = await fetch(`${origin}/api/auth/callback/credentials`, {
  method: "POST",
  redirect: "manual",
  headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookies, "X-Auth-Return-Redirect": "1" },
  body: new URLSearchParams({
    csrfToken,
    email: "auth-smoke-check@example.invalid",
    password: "deliberately-invalid-password",
    callbackUrl: `${origin}/en/portal`,
  }),
});
const payload = await result.json();
const resultUrl = new URL(payload.url);
assert.equal(resultUrl.searchParams.get("error"), "CredentialsSignin", "Database-backed invalid login should fail as credentials, not server configuration");
console.log("PASS: Invalid credentials rejected through the database-backed provider");
