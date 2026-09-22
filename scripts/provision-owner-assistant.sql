-- Run as the database administrator. No plaintext passwords or automatic
-- privileges based on self-registered email addresses are used.
-- Existing passwords are invalidated; ownership is proved via email recovery.
begin;
insert into public.users (email, name, role, password_hash, locale)
values ('etskar@bluesass.com', 'Blue Sass Owner', 'super_admin', null, 'ar'),
       ('al3rab@bluesass.com', 'Blue Sass Assistant', 'employee', null, 'ar')
on conflict (email) do update set role = excluded.role, password_hash = null;
delete from public.sessions where user_id in
  (select id from public.users where email in ('etskar@bluesass.com', 'al3rab@bluesass.com'));
commit;
