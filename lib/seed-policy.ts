/** Demo seeding is an explicit operation against an isolated, disposable DB. */
export function seedConfiguration(env: Record<string, string | undefined>) {
  if (env.NODE_ENV === "production" || ["VERCEL", "VERCEL_ENV", "VERCEL_URL", "DEPLOYMENT_URL", "NETLIFY", "RENDER", "CI"].some(key => env[key] !== undefined) || env.SEED_DATABASE_CONFIRMATION !== "isolated-demo-database") {
    throw new Error("DEMO_SEED_REQUIRES_ISOLATED_DATABASE");
  }
  // Never fall back to DATABASE_URL or accept a hosted/tunnel-configurable URL.
  // These checks are barriers, not proof of isolation; the database also needs
  // the disposable marker and a nonprivileged role before any fixture writes.
  let target: URL;
  try { target = new URL(env.SEED_DATABASE_URL ?? ""); }
  catch { throw new Error("DEMO_SEED_REQUIRES_LOCAL_TARGET"); }
  if (!["postgres:", "postgresql:"].includes(target.protocol) ||
      target.hostname !== "127.0.0.1" || target.port !== "55432" ||
      target.pathname !== "/bluesass_seed_test" || target.username !== "bluesass_seed" ||
      !target.password || target.search || target.hash) {
    throw new Error("DEMO_SEED_REQUIRES_LOCAL_TARGET");
  }
  const email = env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.SEED_ADMIN_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.invalid$/.test(email) || email.length > 254 ||
      !password || password.length < 16 || Buffer.byteLength(password, "utf8") > 72 ||
      /changeme|password|placeholder|example/i.test(password)) {
    throw new Error("DEMO_SEED_REQUIRES_EXPLICIT_CREDENTIALS");
  }
  return { email, password, databaseUrl: target.href };
}

export function assertSeedDatabaseIdentity(identity: {
  database_name: string; role_name: string; marker: string | null;
  privileged: boolean; empty: boolean;
}) {
  if (identity.database_name !== "bluesass_seed_test" || identity.role_name !== "bluesass_seed" ||
      identity.marker !== "blue-sass:disposable-seed:v1" || identity.privileged !== false || identity.empty !== true) {
    throw new Error("DEMO_SEED_DATABASE_IDENTITY_REJECTED");
  }
}
