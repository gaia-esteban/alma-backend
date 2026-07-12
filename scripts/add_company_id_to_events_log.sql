-- Add company scoping to events_log.
-- Nullable: some events (unknown-email failed logins, generic APP events, or
-- events submitted via the API-key path without an authenticated user) have
-- no resolvable company.
-- PostgreSQL

ALTER TABLE events_log
  ADD COLUMN company_id BIGINT REFERENCES company(id) ON DELETE SET NULL;

CREATE INDEX idx_events_log_company_id ON events_log(company_id);

-- Backfill existing rows to company 1 (adjust if a different default company is desired).
UPDATE events_log
  SET company_id = 1
  WHERE company_id IS NULL;
