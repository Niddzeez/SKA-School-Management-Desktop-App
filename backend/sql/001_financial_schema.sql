-- ============================================================
-- SKA School Management System — Financial Schema (Phase 3)
-- ============================================================
-- Subsystem: PostgreSQL (financial)
-- Identity data (students, classes) lives in MongoDB; only their
-- TEXT IDs are stored here as opaque references.
-- gen_random_uuid() is used instead of uuid_generate_v4() because
-- Neon Postgres does not allow installing the uuid-ossp extension.
-- gen_random_uuid() is a Postgres 13+ built-in requiring no extension.
-- ============================================================

-- ============================================================
-- 1. ACADEMIC SESSIONS
-- Maps to frontend AcademicYearMeta (AcademicYearContext).
-- name format: '2025-26'
-- is_closed: once TRUE, new adjustments are blocked.
-- Payments on closed years are still allowed (late settlement).
-- ============================================================
CREATE TABLE IF NOT EXISTS academic_sessions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL UNIQUE,           -- '2025-26'
  start_date  DATE        NOT NULL,
  end_date    DATE        NOT NULL,
  is_closed   BOOLEAN     NOT NULL DEFAULT FALSE,
  closed_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_dates     CHECK (end_date > start_date),
  CONSTRAINT chk_closed_at CHECK (
    (is_closed = FALSE AND closed_at IS NULL) OR
    (is_closed = TRUE  AND closed_at IS NOT NULL)
  )
);

-- ============================================================
-- 2. STUDENT FEE LEDGERS
-- One row per (student, academic year).
-- Maps to frontend StudentFeeLedger type.
-- base_components is a JSONB snapshot of FeeComponentSnapshot[]:
--   [{ "name": "Tuition", "amount": 12000 }, ...]
-- This snapshot is IMMUTABLE once any payment exists (see trigger).
-- student_id and class_id are opaque MongoDB ObjectId strings.
-- ============================================================
CREATE TABLE IF NOT EXISTS student_fee_ledgers (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id           TEXT        NOT NULL,
  class_id             TEXT        NOT NULL,
  academic_session_id  UUID        NOT NULL
                         REFERENCES academic_sessions(id)
                         ON DELETE RESTRICT,
  base_components      JSONB       NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Exactly one ledger per student per academic year
  CONSTRAINT uq_ledger_student_year UNIQUE (student_id, academic_session_id),

  -- base_components must be a non-empty JSON array
  CONSTRAINT chk_base_components_array CHECK (
    jsonb_typeof(base_components) = 'array'
    AND jsonb_array_length(base_components) > 0
  )
);

-- ============================================================
-- TRIGGER: Prevent base_components from changing once a payment
-- exists for this ledger (base fee snapshot must be immutable).
-- ============================================================
CREATE OR REPLACE FUNCTION trg_lock_base_components()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fire when base_components actually changes
  IF NEW.base_components IS NOT DISTINCT FROM OLD.base_components THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM payments WHERE ledger_id = OLD.id LIMIT 1
  ) THEN
    RAISE EXCEPTION
      'base_components are immutable once a payment exists for ledger %', OLD.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lock_base_components_after_payment ON student_fee_ledgers;
CREATE TRIGGER lock_base_components_after_payment
  BEFORE UPDATE OF base_components ON student_fee_ledgers
  FOR EACH ROW
  EXECUTE FUNCTION trg_lock_base_components();

-- ============================================================
-- 3. LEDGER ADJUSTMENTS
-- Append-only log of fee modifications.
-- Maps to frontend LedgerAdjustment type.
-- Amount sign convention (enforced by chk_adjustment_sign):
--   Negative → reduces fee owed  (DISCOUNT, CONCESSION, WAIVER)
--   Positive → increases fee owed (EXTRA, LATE_FEE)
-- ============================================================
CREATE TABLE IF NOT EXISTS ledger_adjustments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_id   UUID        NOT NULL
                REFERENCES student_fee_ledgers(id)
                ON DELETE RESTRICT,    -- never silently remove adjustments
  type        TEXT        NOT NULL CHECK (
                type IN ('DISCOUNT','CONCESSION','WAIVER','EXTRA','LATE_FEE')
              ),
  amount      NUMERIC(10, 2)     NOT NULL CHECK (amount <> 0),
  reason      TEXT        NOT NULL,
  approved_by TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Enforce natural sign direction per adjustment type
  CONSTRAINT chk_adjustment_sign CHECK (
    (type IN ('DISCOUNT','CONCESSION','WAIVER') AND amount < 0) OR
    (type IN ('EXTRA','LATE_FEE')               AND amount > 0)
  )
);

-- Adjustments are append-only: no row may ever be changed or removed
REVOKE UPDATE, DELETE ON ledger_adjustments FROM PUBLIC;

-- ============================================================
-- 4. PAYMENTS
-- Append-only record of every cash receipt.
-- Maps to frontend Payment type.
-- amount must be strictly positive.
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_id    UUID        NOT NULL
                 REFERENCES student_fee_ledgers(id)
                 ON DELETE RESTRICT,
  student_id   TEXT        NOT NULL,     -- denormalised for fast per-student queries
  amount       NUMERIC(10, 2)     NOT NULL CHECK (amount > 0),
  mode         TEXT        NOT NULL CHECK (
                 mode IN ('CASH','UPI','BANK','CARD','CHEQUE')
               ),
  reference    TEXT,
  collected_by TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments are append-only
REVOKE UPDATE, DELETE ON payments FROM PUBLIC;

-- ============================================================
-- 5. EXPENSES
-- School operational expenditure (not linked to a student ledger).
-- Maps to frontend Expense type.
-- expense_date stored as DATE; frontend sends/receives YYYY-MM-DD.
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  category     TEXT        NOT NULL CHECK (
                 category IN ('SALARY','UTILITY','MAINTENANCE','PURCHASE','OTHER')
               ),
  description  TEXT        NOT NULL,
  amount       NUMERIC(10, 2)     NOT NULL CHECK (amount > 0),
  expense_date DATE        NOT NULL,
  paid_to      TEXT        NOT NULL,
  mode         TEXT        NOT NULL CHECK (
                 mode IN ('CASH','BANK','UPI')
               ),
  recorded_by  TEXT        NOT NULL,
  reference    TEXT,
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. INDEXES
-- Covers the common query patterns used by the frontend contexts.
-- ============================================================

-- Ledger lookups
CREATE INDEX IF NOT EXISTS idx_ledgers_student_id
  ON student_fee_ledgers(student_id);
CREATE INDEX IF NOT EXISTS idx_ledgers_session_id
  ON student_fee_ledgers(academic_session_id);

-- Adjustment lookups by ledger
CREATE INDEX IF NOT EXISTS idx_adjustments_ledger_id
  ON ledger_adjustments(ledger_id);

-- Payment lookups by ledger and by student
CREATE INDEX IF NOT EXISTS idx_payments_ledger_id
  ON payments(ledger_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id
  ON payments(student_id);

-- Expense report queries
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date
  ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category
  ON expenses(category);

-- ============================================================
-- 7. LEDGER SUMMARY VIEW
-- All financial totals are DERIVED here — nothing is stored.
-- Adjustments use signed amounts so SUM gives the correct net.
-- frontend finalFee = base_total + adjustments_total
-- frontend pending  = finalFee  - paid_total
-- ============================================================
CREATE OR REPLACE VIEW ledger_summary AS
SELECT
  l.id                   AS ledger_id,
  l.student_id,
  l.class_id,
  s.name                 AS academic_year,
  s.is_closed,

  -- Base fee total derived from the JSONB snapshot
  (
    SELECT COALESCE(SUM((c->>'amount')::NUMERIC(10, 2)), 0)
    FROM   jsonb_array_elements(l.base_components) AS c
  )                      AS base_total,

  -- Net adjustments (signed: discounts are negative, extras positive)
  COALESCE((
    SELECT SUM(a.amount)
    FROM   ledger_adjustments a
    WHERE  a.ledger_id = l.id
  ), 0)                  AS adjustments_total,

  -- Total collected so far
  COALESCE((
    SELECT SUM(p.amount)
    FROM   payments p
    WHERE  p.ledger_id = l.id
  ), 0)                  AS paid_total

FROM student_fee_ledgers l
JOIN academic_sessions   s ON s.id = l.academic_session_id;