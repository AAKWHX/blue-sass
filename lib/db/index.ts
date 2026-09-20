/**
 * PostgreSQL connection for the Node runtime, compatible with Supabase.
 * Prepared statements are disabled for transaction-pooler compatibility.
 *
 * `isDatabaseConfigured` lets every caller fall back to bundled mock data so
 * the preview keeps working before the database is provisioned.
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
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
  return drizzle(postgres(url, {
    prepare: false,
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
  }), { schema, casing: "snake_case" });
}

export const db = makeDb();
export { schema };
