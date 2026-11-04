// Auth.js identifies users in the server. Supabase Data API roles must not
// access these private tables directly. Explicit server grants and ownership
// remain unchanged; verify effective server privileges before applying.
export const privateServerTables = Object.freeze([
  "hosted_sites", "project_requests", "project_billing", "platform_owner",
  "staff_access", "staff_invitations", "admin_audit", "subscription_orders",
  "project_agreements", "project_decisions", "site_audits", "security_rate_limits",
  "tool_usage", "marketplace_listings", "marketplace_offers", "marketplace_orders", "platform_content", "payments",
]);
const allowed = new Set([...privateServerTables, "reviews"]);
export async function protectServerTables(transaction, tables) {
  if (!tables.length || tables.some(name => !allowed.has(name))) throw new Error("Unexpected security migration table.");
  const roles = await transaction`SELECT rolname FROM pg_roles WHERE rolname IN ('anon', 'authenticated')`;
  for (const table of tables) {
    await transaction`ALTER TABLE public.${transaction(table)} ENABLE ROW LEVEL SECURITY`;
    if (privateServerTables.includes(table)) {
      // PUBLIC is a pseudo-role: quoting it as an identifier changes its meaning.
      // Named-role revocations alone do not remove inherited PUBLIC privileges.
      await transaction`REVOKE ALL PRIVILEGES ON TABLE public.${transaction(table)} FROM PUBLIC`;
      for (const {rolname} of roles) {
        await transaction`REVOKE ALL PRIVILEGES ON TABLE public.${transaction(table)} FROM ${transaction(rolname)}`;
      }
    } else if (table === "reviews") {
      // Keep any existing review SELECT grants and policies unchanged.
      // Whole-table operations such as TRUNCATE are not constrained by RLS.
      await transaction`REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.${transaction(table)} FROM PUBLIC`;
      for (const {rolname} of roles) {
        await transaction`REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.${transaction(table)} FROM ${transaction(rolname)}`;
      }
    }
  }
}
