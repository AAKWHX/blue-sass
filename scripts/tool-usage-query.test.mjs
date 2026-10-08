import test from "node:test";
import assert from "node:assert/strict";
import {PgDialect} from "drizzle-orm/pg-core";
import {load} from "./test-typescript-loader.mjs";
const {quotaUsageQuery}=load("lib/db/usage-query.ts");
test("quota query binds timestamps in the postgres-js adapter's serialized format",()=>{
 const user="00000000-0000-4000-8000-000000000000";const start=new Date("2026-10-01T00:00:00Z");
 const query=new PgDialect().sqlToQuery(quotaUsageQuery(user,start));
 assert.deepEqual(query.params,[user,start.toISOString(),user,start.toISOString()]);
 assert.ok(!query.params.some(value=>value instanceof Date));assert.ok(!query.sql.includes(user));
});
