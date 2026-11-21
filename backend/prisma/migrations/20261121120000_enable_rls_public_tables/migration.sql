-- Closes the Supabase Data API (PostgREST) for every table in "public".
--
-- The app never uses the Data API: the backend talks to Postgres through
-- Prisma as the "postgres" role, which owns these tables and has BYPASSRLS,
-- so none of this changes what the backend can do. Without it, anyone with
-- the project URL and the public anon key could read, edit and delete every
-- row through /rest/v1 (Supabase advisors: rls_disabled_in_public and
-- sensitive_columns_exposed).

-- 1. Row Level Security on, with no policies: anon/authenticated get no rows.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "File" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TaskTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- 2. Also drop the table grants of the Data API roles. These roles only
--    exist on Supabase, so a plain Postgres (e.g. the shadow database of
--    `prisma migrate dev`) skips this block instead of failing.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated';
  END IF;
END $$;
