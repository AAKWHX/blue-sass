# Local security follow-up — no production authorization

Nothing in this folder connects automatically. Do not use `db:migrate`,
`db:push`, `provision-owner-assistant.sql`, or an `apply-*-migration.mjs` runner
as a shortcut for table ACL repair. They have unrelated schema/account/data effects.

## Offline checks

```powershell
node --test scripts/server-table-security.test.mjs scripts/seed-policy.test.mjs scripts/security-verification.test.mjs
node scripts/security/preview-table-hardening.mjs
```

`table-hardening.review.sql` is an offline review artifact generated from the
helper. It assumes both Supabase roles exist and ends in **ROLLBACK**. It is
not a registered migration or approved executable production change. The helper
itself discovers optional roles; importing it performs no database operations.

Payments use Auth.js-authorized server code and the server-only `DATABASE_URL`
connection (`lib/db/index.ts`, `lib/db/payments.ts`). They have no required public
Data API read path in the reviewed source. The connection's actual role is
**unverified**. Before applying the draft, establish that this role is an owner
or has independent explicit privileges and appropriate RLS access; a role relying
on PUBLIC access can break. Existing named server-role grants are not revoked.
No service key is required by these scripts. Never expose a privileged key to a browser.

Reviews are read through the server with an approved-status filter, submitted
after `requireViewer` / `assertCanWrite`, and moderated with `reviews.manage`.
No client table mutation grant is needed by these paths. Existing table SELECT
grants and **all policies** remain unchanged. Policies in an actual database
have not been read in this task. No new policy is created.

Table revocation does not erase column ACLs or grants inherited through other
roles. The catalog inspection exposes both. Any surviving effective privileges,
RPC/definer paths, views, or server privilege dependencies must be reviewed on
the isolated target before approval. Do not expand this draft blindly.

## Catalog-only inspection, after independent isolation verification

`inspect-table-access.sql` reads system catalogs, never customer rows. It shows
table existence/RLS/owner, table and column ACLs including PUBLIC (grantee 0),
effective named-role privileges, existing policies, default ACLs, trigger and
function metadata and role memberships. It excludes function bodies/trigger
arguments. Dynamic SQL dependencies cannot be fully discovered from `pg_depend`;
inspect their source privately. Treat policy expressions as private metadata.

Use a separately configured **test-only** PostgreSQL service definition, with
credentials held outside command history. Verify its resolved host, database,
container/instance identity and owner against the disposable test instance first.
Do not copy or reuse the application's connection settings.

```powershell
psql -X --no-password 'service=bluesass_isolated_review' -v ON_ERROR_STOP=1 -c 'BEGIN READ ONLY' -f scripts/security/inspect-table-access.sql -c 'ROLLBACK'
```

This command is a future plan and was **not run**. A failed/missing metadata
result is not a clean bill of health. `SELECT`/mutation operation names appearing
inside string literals in the privilege matrix are data, not mutation statements.
The local test verifies that all executable statements start with SELECT and
contain no mutation keywords outside comments and string literals. This is a
source check, not a PostgreSQL parser or live execution test.

## Disposable schema rebuild rehearsal (not executed)

1. Provision a new local PostgreSQL instance/container with a reviewed image
   digest, bind port 55432 only to 127.0.0.1, and block outbound network access.
   Confirm it is a new instance, not a tunnel/proxy, and has no production mount,
   restore, credential, customer data or shared network. Record that evidence.
2. Use separate fresh databases for the journal-only and candidate full replay
   paths. Create synthetic anon/authenticated roles there if absent. Inventory
   is in `docs/security-followup-2026-10-19/migration-mapping.md`.
3. Replay the journal's four entries on the first schema, using `psql -X` and
   `ON_ERROR_STOP=1` with the independently verified test service. Compare catalogs
   with `lib/db/schema.ts`. Expect missing reviews, private platform/business
   tables and payment-stage columns; document each difference, do not mask it.
4. Design a reviewed full baseline for the second schema from the mapping,
   without renaming/deleting/reordering existing files in this repository.
   A candidate order is the four journal entries, the customer-review SQL,
   then hosting, project-request, platform-tools, security and business effects.
   This is **not** an approved replay: platform-tools requires a verified
   synthetic owner beforehand, and lock-down SQL revokes schema-wide grants.
   Extract/review those effects or prepare a reconciled baseline first.
5. Compare actual columns/types/defaults/enums, unique and regular indexes,
   foreign keys/delete actions, checks, RLS, policies and ACLs on both paths.
   Test fresh replay, rerun behavior, partial failure and existing-data upgrades.
   `IF NOT EXISTS` does not validate the shape of an existing object.
6. Before ACL changes, inspect catalogs; apply the draft in a transaction and
   inspect again **before its rollback**. Rehearse actual commit only inside
   this disposable instance with a separately reviewed test harness.
7. Use synthetic accounts A/B, restricted staff, read-only staff and owner.
   Assert public effective INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER are
   false; payments SELECT is false for public API roles; review SELECT is
   unchanged and policies filter exactly as before. Test column ACLs and
   inherited roles explicitly. Run destructive privilege probes only here.
8. Verify legitimate server payment/review reads and writes with an independently
   authorized server role; test cross-account isolation and moderation.
   An Auth.js session is not a Supabase Auth JWT; do not invent auth.uid policies.
9. Only after matching replay results, review history reconciliation against
   catalog-only migration history from the approved target. Do not edit the
   journal merely to match filenames. Central template persistence stays off.

No working PostgreSQL/Docker tooling or proven isolated target was available
in this task. No schema was rebuilt, no SQL executed, no seed run.

## Seed prerequisites (not executed)

Required environment names: `SEED_DATABASE_URL`, `SEED_DATABASE_CONFIRMATION`,
`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`. No `.env` files are loaded and
`DATABASE_URL` is never used. Supply all values privately, never log them.
The confirmation is an acknowledgement, **not proof of isolation**.

The URL must use PostgreSQL, loopback 127.0.0.1:55432, database
`bluesass_seed_test`, role `bluesass_seed`, and no query/fragment overrides.
The independently verified disposable database must carry the database comment
`blue-sass:disposable-seed:v1`. The role cannot be superuser or BYPASSRLS.
It needs ownership/permissions on the fixture schema, including RLS access,
and must have no access to any real database. Users/projects/leads must be empty.
Create the marker/role/schema **only after** verifying the fresh test instance;
do not mark an existing application database to bypass the guard.

Production and deployment/CI indicators are rejected even when present but empty.
All fixture emails use `.invalid`; password input is explicit with no defaults.
Synthetic accounts share the supplied throwaway password only in this disposable
fixture. Logs never show passwords/connection strings/raw driver errors.
The seed is intentionally no longer rerunnable against populated data; after a
partial failure use a new disposable database. Writes are not one atomic batch.

Only after these prerequisites and schema replay succeed:

```powershell
npm run db:seed
```

This command is documentation only; do not run it during this task.

## Application integration before any deployment decision

Use separate sandbox-only payment credentials/webhook and synthetic data.
Exercise create/capture, success/failure/cancel, duplicate requests/webhooks,
reconciliation, cross-user access and refunds if supported. Check DB state and
server entitlements after each; never use real money. Test OAuth and mail with
test accounts/inboxes only. Review logs for credentials and sensitive payloads.
Central template publishing must remain disabled until migration reconciliation,
authorization, revision/concurrency and audit tests pass on the isolated target.

Deployment, production ACL/schema/data changes, enabling template persistence,
account/session changes and risk acceptance each require separate approval.
