// Offline SQL preview only. No database driver, environment loading or runner.
import { protectServerTables } from "../server-table-security.mjs";

export async function previewTableHardening() {
  const statements = [];
  const transaction = (strings, ...values) => {
    if (typeof strings === "string") return `"${strings.replaceAll('"', '""')}"`;
    const query = strings.reduce((sql, part, index) => sql + part + (values[index] ?? ""), "");
    if (query.startsWith("SELECT")) return Promise.resolve([{ rolname: "anon" }, { rolname: "authenticated" }]);
    statements.push(query + ";");
    return Promise.resolve([]);
  };
  await protectServerTables(transaction, ["payments", "reviews"]);
  return ["-- REVIEW DRAFT ONLY. Not approved for production. Isolated rehearsal required.",
    "-- Assumes anon/authenticated exist; preserves review SELECT and policies.",
    "BEGIN;", ...statements, "ROLLBACK;"].join("\n");
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/preview-table-hardening.mjs")) {
  console.log(await previewTableHardening());
}
