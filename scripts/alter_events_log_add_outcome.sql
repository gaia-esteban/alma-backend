-- Add outcome column to events_log
-- PostgreSQL
ALTER TABLE events_log
  ADD COLUMN outcome VARCHAR(10) CHECK (outcome IN ('FAILED', 'SUCCESS'));

-- MySQL equivalent
-- ALTER TABLE events_log
--   ADD COLUMN outcome ENUM('FAILED', 'SUCCESS') NULL;
