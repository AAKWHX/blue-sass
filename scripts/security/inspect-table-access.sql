-- Catalog-only verification. Execute in a read-only transaction using an
-- independently verified isolated target. Never selects application rows.
-- Missing roles/tables are visible; PUBLIC is ACL grantee 0, not a pg_roles row.

SELECT wanted.name, c.oid IS NOT NULL AS exists, c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced, pg_get_userbyid(c.relowner) AS owner
FROM (VALUES ('payments'), ('reviews')) AS wanted(name)
LEFT JOIN pg_namespace n ON n.nspname = 'public'
LEFT JOIN pg_class c ON c.relnamespace = n.oid AND c.relname = wanted.name
  AND c.relkind IN ('r', 'p');

SELECT c.relname, CASE WHEN a.grantee = 0 THEN 'PUBLIC'
       ELSE pg_get_userbyid(a.grantee) END AS grantee,
       pg_get_userbyid(a.grantor) AS grantor, a.privilege_type, a.is_grantable
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
CROSS JOIN LATERAL aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) a
WHERE n.nspname = 'public' AND c.relname IN ('payments', 'reviews');

SELECT c.relname, wanted.name AS role, r.oid IS NOT NULL AS role_exists,
       p.name AS privilege, CASE WHEN r.oid IS NOT NULL
       THEN has_table_privilege(r.oid, c.oid, p.name) END AS effective
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
CROSS JOIN (VALUES ('anon'), ('authenticated'), ('service_role')) wanted(name)
LEFT JOIN pg_roles r ON r.rolname = wanted.name
CROSS JOIN (VALUES ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'),
                   ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')) p(name)
WHERE n.nspname = 'public' AND c.relname IN ('payments', 'reviews');

-- Column ACLs can survive a table-level revocation.
SELECT c.relname, col.attname, CASE WHEN a.grantee = 0 THEN 'PUBLIC'
       ELSE pg_get_userbyid(a.grantee) END AS grantee,
       a.privilege_type, a.is_grantable
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_attribute col ON col.attrelid = c.oid AND col.attnum > 0 AND NOT col.attisdropped
CROSS JOIN LATERAL aclexplode(col.attacl) a
WHERE n.nspname = 'public' AND c.relname IN ('payments', 'reviews');

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('payments', 'reviews');

SELECT pg_get_userbyid(d.defaclrole) AS owner,
       coalesce(n.nspname, '(all schemas)') AS schema, d.defaclobjtype,
       CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END AS grantee,
       a.privilege_type, a.is_grantable
FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace
CROSS JOIN LATERAL aclexplode(d.defaclacl) a
WHERE d.defaclnamespace = 0 OR n.nspname = 'public';

-- No trigger arguments or function bodies: these can embed sensitive literals.
SELECT c.relname, t.tgname, t.tgenabled, t.tgisinternal,
       fn.nspname AS function_schema, p.proname, p.oid AS function_oid,
       pg_get_userbyid(p.proowner) AS function_owner, p.prosecdef AS security_definer
FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid JOIN pg_namespace fn ON fn.oid = p.pronamespace
WHERE n.nspname = 'public' AND c.relname IN ('payments', 'reviews');

-- All public functions plus catalog-tracked dependencies; dynamic SQL and
-- string-body SQL dependencies need a separate private source review.
SELECT DISTINCT fn.nspname AS schema, p.proname, p.oid,
       pg_get_userbyid(p.proowner) AS owner, p.prosecdef AS security_definer,
       CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END AS grantee,
       a.privilege_type
FROM pg_proc p JOIN pg_namespace fn ON fn.oid = p.pronamespace
LEFT JOIN pg_depend dep ON dep.classid = 'pg_proc'::regclass AND dep.objid = p.oid
  AND dep.refclassid = 'pg_class'::regclass
LEFT JOIN pg_class c ON c.oid = dep.refobjid
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN LATERAL aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a ON true
WHERE fn.nspname = 'public' OR (n.nspname = 'public' AND c.relname IN ('payments', 'reviews'));

SELECT member.rolname AS member, parent.rolname AS inherited_role,
       member.rolinherit, parent.rolsuper, parent.rolbypassrls
FROM pg_auth_members m JOIN pg_roles member ON member.oid = m.member
JOIN pg_roles parent ON parent.oid = m.roleid
WHERE member.rolname IN ('anon', 'authenticated', 'service_role', current_user)
   OR pg_has_role(current_user, member.oid, 'MEMBER');

SELECT current_user AS connection_role, r.rolsuper, r.rolbypassrls
FROM pg_roles r WHERE r.rolname = current_user;
