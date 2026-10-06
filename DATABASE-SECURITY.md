# Database access model and incident remediation

Verified on 7 October 2026 for Supabase project `nnhixorravjljzqtqqkh`.

Blue Sass uses Auth.js sessions and a trusted server-side PostgreSQL connection.
Application user IDs must not be treated as Supabase `auth.uid()` identities.
Server routes continue to enforce account ownership and granted capabilities.
RLS does not replace those checks when the server connects as a table owner or
a role with BYPASSRLS.

## Confirmed exposure and remediation

Eleven new public tables were missing RLS and inherited Supabase's public
Data API grants: hosted_sites, project_requests, project_billing,
platform_owner, staff_access, staff_invitations, admin_audit,
subscription_orders, project_agreements, project_decisions and site_audits.

The live database received these named migrations:

- `enable_rls_on_confirmed_exposed_blue_sass_tables`
- `remove_unused_client_grants_on_confirmed_private_tables`

All eleven now have RLS enabled and no CRUD privileges for anon/authenticated.
Trusted postgres/service_role permissions were preserved. No application data,
account ownership or existing public review policy was changed.

Verification found zero public tables without RLS, no public views or functions,
and no Storage buckets. Anonymous and authenticated SQL role probes returned
zero private rows before grants were removed; the subsequent anonymous read
probe failed with permission denied. Server access still reads existing data.
The designated owner remains unchanged and staff_access contains no grants.
These checks do not establish that historical unauthorized access never occurred.

## Deployment protection

`scripts/server-table-security.mjs` protects each newly created application
table inside the same transaction as its creation. It removes unused client
grants from the eleven private tables; existing public review grants/policies
are preserved. It never enables FORCE RLS or removes server-role privileges.
All 24 application tables also declare `.enableRLS()` in the Drizzle schema,
so ORM schema changes do not infer that RLS should be disabled.

Prebuild runs a regression check requiring every application table created by
a deployment migration to appear in its protection call. Add new access models
deliberately, including appropriate policies if a table genuinely needs Data
API access. Do not use USING(true) policies on private data to suppress warnings.

The advisor's RLS-enabled/no-policy INFO is intentional for these server-only
tables. The leaked-password-protection WARN concerns Supabase Auth settings;
the site's current sign-in implementation uses Auth.js. Supabase documents
that its leaked-password protection requires Pro or above. No subscription was
purchased and no authentication credentials were rotated during this fix.

Security advisor:
https://supabase.com/dashboard/project/nnhixorravjljzqtqqkh/advisors/security
