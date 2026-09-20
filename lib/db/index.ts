/**
 * Neon connection. Uses the HTTP driver, which works on the Vercel Edge and
 * Node runtimes without connection pooling headaches.
 *
 * `isDatabaseConfigured` lets every caller fall back to bundled mock data so
 * the preview keeps working before the database is provisioned.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "";

export const isDatabaseConfigured =
  url.startsWith("postgres://") || url.startsWith("postgresql://");

/**
 * Throws on use when unconfigured rather than at import time, so that building
 * the app without a database still succeeds.
 */
function makeDb() {
  if (!isDatabaseConfigured) {
    return new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
      get() {
        throw new Error(
          "DATABASE_URL is not set. Add your Neon connection string to .env.local (see .env.example).",
        );
      },
    });
  }
  return drizzle(neon(url), { schema, casing: "snake_case" });
}

export const db = makeDb();
export { schema };
