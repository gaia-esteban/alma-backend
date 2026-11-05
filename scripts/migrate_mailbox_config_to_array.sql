-- Multiple inbound mailboxes per company.
-- Adds company.mailbox_configs (JSONB array) and copies each company's existing
-- single company.mailbox_config object into it as a one-element array.
--
-- Each element has the same shape mailbox_config had, plus an optional "enabled"
-- flag (default true; false = keep the credentials but stop polling it):
--   [ { "provider": "microsoft-graph", "tenantId": "...", "clientId": "...",
--       "clientSecret": "...", "mailboxUser": "facturas@empresa.com" },
--     { "provider": "gmail", "clientId": "...", "clientSecret": "...",
--       "refreshToken": "...", "mailboxUser": "proveedores@empresa.com", "enabled": true } ]
--
-- mailbox_config is left in place (unused by the new builds) so rolling back is
-- just redeploying the previous builds. Drop it later with
-- drop_company_mailbox_config.sql once the new builds are stable.
--
-- Run BEFORE deploying the new alma-mailbox-reader and backend-nodejs-alMa
-- builds: both select mailbox_configs. Safe to run while the old builds are
-- live (they ignore the new column). Idempotent.
-- PostgreSQL

BEGIN;

ALTER TABLE company
  ADD COLUMN IF NOT EXISTS mailbox_configs JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE company
  DROP CONSTRAINT IF EXISTS company_mailbox_configs_is_array;
ALTER TABLE company
  ADD CONSTRAINT company_mailbox_configs_is_array
  CHECK (jsonb_typeof(mailbox_configs) = 'array');

-- Only backfill rows not migrated yet, so re-running never duplicates entries
-- or overwrites mailboxes added after the first run.
UPDATE company
SET mailbox_configs = jsonb_build_array(mailbox_config)
WHERE mailbox_config IS NOT NULL
  AND jsonb_typeof(mailbox_config) = 'object'
  AND mailbox_configs = '[]'::jsonb;

COMMIT;

-- Verification: every company that had a mailbox_config should now show n = 1
-- and the same mailbox address in both columns.
SELECT id,
       description,
       mailbox_config->>'mailboxUser'               AS old_mailbox,
       jsonb_array_length(mailbox_configs)          AS n,
       mailbox_configs->0->>'mailboxUser'           AS new_first_mailbox
FROM company
ORDER BY id;
