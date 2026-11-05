-- Follow-up to migrate_mailbox_config_to_array.sql.
-- Drops the legacy single-mailbox column once the alma-mailbox-reader and
-- backend-nodejs-alMa builds that read company.mailbox_configs are deployed
-- and confirmed stable. After this, rolling back to a pre-multi-mailbox build
-- is no longer possible without restoring the column.
-- PostgreSQL

ALTER TABLE company DROP COLUMN IF EXISTS mailbox_config;
