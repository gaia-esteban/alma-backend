-- Create enum types
CREATE TYPE entity_type AS ENUM ('INCOMING_ORDER', 'APP', 'SUPPLIER');
CREATE TYPE event_name_type AS ENUM ('LOGGED_IN', 'ACCOUNTING_FILE_CREATED', 'SUPPLIER_UPDATED');

-- Create table
CREATE TABLE events_log (
    id          BIGSERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    entity      entity_type NOT NULL,
    event_name  event_name_type NOT NULL,
    user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_email  VARCHAR(100)
);

-- Indexes for common filter patterns
CREATE INDEX idx_events_log_entity      ON events_log(entity);
CREATE INDEX idx_events_log_event_name  ON events_log(event_name);
CREATE INDEX idx_events_log_user_id     ON events_log(user_id);
CREATE INDEX idx_events_log_created_at  ON events_log(created_at DESC);
