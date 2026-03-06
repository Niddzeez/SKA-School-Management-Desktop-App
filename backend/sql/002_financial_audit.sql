-- ============================================================
-- 8. FINANCIAL AUDIT LOG (Phase 9)
-- Append-only log for financial transaction traceability.
-- ============================================================
CREATE TABLE IF NOT EXISTS financial_audits (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type    TEXT        NOT NULL,
  entity_type   TEXT        NOT NULL,
  entity_id     UUID        NOT NULL,
  performed_by  TEXT        NOT NULL,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce append-only constraint
REVOKE UPDATE, DELETE ON financial_audits FROM PUBLIC;

-- Index for querying audit history by entity
CREATE INDEX IF NOT EXISTS idx_financial_audits_entity 
  ON financial_audits(entity_type, entity_id);

-- Index for querying by user
CREATE INDEX IF NOT EXISTS idx_financial_audits_user 
  ON financial_audits(performed_by);
