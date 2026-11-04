-- REVIEW DRAFT ONLY. Not approved for production. Isolated rehearsal required.
-- Assumes anon/authenticated exist; preserves review SELECT and policies.
BEGIN;
ALTER TABLE public."payments" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."payments" FROM PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE public."payments" FROM "anon";
REVOKE ALL PRIVILEGES ON TABLE public."payments" FROM "authenticated";
ALTER TABLE public."reviews" ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public."reviews" FROM PUBLIC;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public."reviews" FROM "anon";
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public."reviews" FROM "authenticated";
ROLLBACK;
