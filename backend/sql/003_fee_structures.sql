-- ============================================================
-- SKA School Management System — Financial Schema Update
-- Creating fee_structures table
-- ============================================================

CREATE TABLE IF NOT EXISTS fee_structures (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id             TEXT        NOT NULL,
  academic_session_id  UUID        NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
  status               TEXT        NOT NULL CHECK (status IN ('DRAFT', 'ACTIVE')),
  components           JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One active fee structure per class per academic session is a common rule,
  -- but we'll enforce unique across draft and active to keep it simple, 
  -- or we allow multiple and frontend filters. The frontend expects one active per class/session.
  CONSTRAINT uq_fee_structure_class_session UNIQUE (class_id, academic_session_id)
);

CREATE INDEX IF NOT EXISTS idx_fee_structures_class_id ON fee_structures(class_id);
CREATE INDEX IF NOT EXISTS idx_fee_structures_session_id ON fee_structures(academic_session_id);
