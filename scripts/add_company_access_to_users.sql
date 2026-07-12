-- Replace the single, unused users.company_id column with company_access,
-- an array of company ids (as text) a user is allowed to operate on.
-- PostgreSQL

-- 1. Add the new column, nullable for now so we can backfill existing rows.
ALTER TABLE users
  ADD COLUMN company_access TEXT[];

-- 2. Backfill all existing rows to company 1 (adjust if a different default company is desired).
UPDATE users
  SET company_access = ARRAY['1']
  WHERE company_access IS NULL;

-- 3. Enforce NOT NULL and "at least one company" going forward.
ALTER TABLE users
  ALTER COLUMN company_access SET NOT NULL,
  ADD CONSTRAINT users_company_access_not_empty CHECK (array_length(company_access, 1) > 0);

-- 4. Drop the old, superseded column.
ALTER TABLE users
  DROP COLUMN company_id;
