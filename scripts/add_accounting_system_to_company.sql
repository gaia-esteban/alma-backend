-- Per-company accounting system selection.
-- accounting_system: which system receives exported invoices.
--   'contai' (default) -> CSV file uploaded to OneDrive (existing behaviour).
--   'siigo'            -> documents posted to the Siigo API.
-- accounting_config: settings for API-based systems. Shape for siigo (validated by
-- the Company model in backend-nodejs-alMa; costCenterId optional, rest required):
--   { "url": "https://api.siigo.com", "username": "...", "accessKey": "...", "partnerId": "AlMa",
--     "purchaseDocumentId": 24446,
--     "endpoints": { "purchases": "/v1/purchases", "suppliers": "/v1/customers" },
--     "costCenterId": 235,
--     "taxes": [ { "type": "IVA", "percentage": 19, "id": 13156 } ],
--     "paymentTypes": { "contado": 5636, "credito": 5637 } }
-- Existing companies keep working unchanged via the 'contai' default.
-- Run BEFORE deploying the new alma-mailbox-reader build: its company cache
-- selects these columns at startup.
-- PostgreSQL

ALTER TABLE company
  ADD COLUMN accounting_system TEXT NOT NULL DEFAULT 'contai',
  ADD COLUMN accounting_config JSONB NULL;

ALTER TABLE company
  ADD CONSTRAINT company_accounting_system_check
  CHECK (accounting_system IN ('contai', 'siigo'));
