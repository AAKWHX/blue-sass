import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { previewTableHardening } from "./security/preview-table-hardening.mjs";

test("catalog verification is read-only and never selects customer tables", () => {
  const source = readFileSync("scripts/security/inspect-table-access.sql", "utf8");
  const sql = source.replace(/--[^\n]*/g, "").replace(/'(?:''|[^'])*'/g, "''");
  assert.doesNotMatch(sql, /\b(ALTER|REVOKE|GRANT|INSERT|UPDATE|DELETE|TRUNCATE|DROP|CREATE|CALL|DO|COPY)\b/i);
  assert.doesNotMatch(sql, /\b(?:FROM|JOIN)\s+public\./i);
  for (const statement of sql.split(";").filter(s => s.trim())) assert.match(statement.trim(), /^SELECT\b/);
  for (const catalog of ["pg_class", "pg_policies", "pg_default_acl", "pg_attribute", "pg_trigger", "pg_proc", "pg_auth_members"]) assert.ok(sql.includes(catalog));
  assert.doesNotMatch(sql, /\b(prosrc|pg_get_functiondef|tgargs)\b/);
});

test("offline hardening preview is limited to the target tables and rolls back", async () => {
  const sql = await previewTableHardening();
  assert.equal(readFileSync("scripts/security/table-hardening.review.sql", "utf8"), sql + "\n");
  assert.match(sql, /FROM PUBLIC/);
  assert.match(sql, /FROM "anon"/);
  assert.match(sql, /FROM "authenticated"/);
  assert.ok(sql.endsWith("ROLLBACK;"));
  assert.doesNotMatch(sql, /(?:^|;)\s*(?:CREATE|INSERT|GRANT|COMMIT)\b/m);
  assert.doesNotMatch(sql, /project_billing|capture_started_at/);
  assert.doesNotMatch(sql, /REVOKE SELECT.*reviews/);
});
