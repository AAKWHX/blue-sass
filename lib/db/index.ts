import "server-only";
import type { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Public execution never reads credentials or constructs a database client.
export const isDatabaseConfigured = false;
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get() { throw new Error("QA_DATABASE_CONFIG_REQUIRED_AND_RUNTIME_LOCKED"); },
});
export { schema };
