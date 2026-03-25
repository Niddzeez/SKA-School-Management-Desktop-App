-- ------------------------------------------------------------
-- 001_init.sql
-- SKA School Management — Initial Schema
-- ------------------------------------------------------------

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
SET default_tablespace = '';
SET default_table_access_method = heap;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
SET search_path TO public;
-- ------------------------------------------------------------
-- FUNCTIONS
-- ------------------------------------------------------------

CREATE FUNCTION public.trg_lock_base_components() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.base_components IS NOT DISTINCT FROM OLD.base_components THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.payments WHERE ledger_id = OLD.id LIMIT 1
  ) THEN
    RAISE EXCEPTION
      'base_components are immutable once a payment exists for ledger %', OLD.id;
  END IF;

  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------
-- TABLES
-- ------------------------------------------------------------

CREATE TABLE public.academic_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_closed boolean DEFAULT false NOT NULL,
    closed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_promotion_locked boolean DEFAULT false NOT NULL,
    CONSTRAINT chk_closed_at CHECK (
        ((is_closed = false) AND (closed_at IS NULL))
        OR
        ((is_closed = true) AND (closed_at IS NOT NULL))
    ),
    CONSTRAINT chk_dates CHECK (end_date > start_date)
);

CREATE TABLE public.fee_structures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_id text NOT NULL,
    academic_session_id uuid NOT NULL,
    status text NOT NULL,
    components jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    version integer DEFAULT 1,
    CONSTRAINT fee_structures_status_check CHECK (
        status = ANY (ARRAY['DRAFT'::text, 'ACTIVE'::text])
    )
);

CREATE TABLE public.student_fee_ledgers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id text NOT NULL,
    class_id text NOT NULL,
    academic_session_id uuid NOT NULL,
    base_components jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_base_components_array CHECK (
        (jsonb_typeof(base_components) = 'array'::text)
        AND
        (jsonb_array_length(base_components) > 0)
    )
);

CREATE TABLE public.ledger_adjustments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ledger_id uuid NOT NULL,
    type text NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason text NOT NULL,
    approved_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ledger_adjustments_type_check CHECK (
        type = ANY (ARRAY[
            'DISCOUNT'::text, 'CONCESSION'::text, 'WAIVER'::text,
            'EXTRA'::text, 'LATE_FEE'::text
        ])
    ),
    CONSTRAINT ledger_adjustments_amount_check CHECK (
        amount <> (0)::numeric
    ),
    CONSTRAINT chk_adjustment_sign CHECK (
        ((type = ANY (ARRAY['DISCOUNT'::text, 'CONCESSION'::text, 'WAIVER'::text])) AND (amount < (0)::numeric))
        OR
        ((type = ANY (ARRAY['EXTRA'::text, 'LATE_FEE'::text])) AND (amount > (0)::numeric))
    )
);

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ledger_id uuid NOT NULL,
    student_id text NOT NULL,
    amount numeric(10,2) NOT NULL,
    mode text NOT NULL,
    reference text,
    collected_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payments_amount_check CHECK (amount > (0)::numeric),
    CONSTRAINT payments_mode_check CHECK (
        mode = ANY (ARRAY[
            'CASH'::text, 'UPI'::text, 'BANK'::text,
            'CARD'::text, 'CHEQUE'::text
        ])
    )
);

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    expense_date date NOT NULL,
    paid_to text NOT NULL,
    mode text NOT NULL,
    recorded_by text NOT NULL,
    reference text,
    recorded_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT expenses_amount_check CHECK (amount > (0)::numeric),
    CONSTRAINT expenses_category_check CHECK (
        category = ANY (ARRAY[
            'SALARY'::text, 'UTILITY'::text, 'MAINTENANCE'::text,
            'PURCHASE'::text, 'OTHER'::text
        ])
    ),
    CONSTRAINT expenses_mode_check CHECK (
        mode = ANY (ARRAY['CASH'::text, 'BANK'::text, 'UPI'::text])
    )
);

CREATE TABLE public.financial_audits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    performed_by text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------
-- CONSTRAINTS
-- ------------------------------------------------------------

ALTER TABLE ONLY public.academic_sessions
    ADD CONSTRAINT academic_sessions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.academic_sessions
    ADD CONSTRAINT academic_sessions_name_key UNIQUE (name);

ALTER TABLE ONLY public.fee_structures
    ADD CONSTRAINT fee_structures_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.student_fee_ledgers
    ADD CONSTRAINT student_fee_ledgers_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.student_fee_ledgers
    ADD CONSTRAINT uq_ledger_student_year UNIQUE (student_id, academic_session_id);

ALTER TABLE ONLY public.ledger_adjustments
    ADD CONSTRAINT ledger_adjustments_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.financial_audits
    ADD CONSTRAINT financial_audits_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.fee_structures
    ADD CONSTRAINT fee_structures_academic_session_id_fkey
    FOREIGN KEY (academic_session_id)
    REFERENCES public.academic_sessions(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.student_fee_ledgers
    ADD CONSTRAINT student_fee_ledgers_academic_session_id_fkey
    FOREIGN KEY (academic_session_id)
    REFERENCES public.academic_sessions(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.ledger_adjustments
    ADD CONSTRAINT ledger_adjustments_ledger_id_fkey
    FOREIGN KEY (ledger_id)
    REFERENCES public.student_fee_ledgers(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_ledger_id_fkey
    FOREIGN KEY (ledger_id)
    REFERENCES public.student_fee_ledgers(id) ON DELETE RESTRICT;

-- ------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------

CREATE INDEX idx_academic_sessions_dates
    ON public.academic_sessions USING btree (start_date, end_date);

CREATE INDEX idx_fee_structures_class_id
    ON public.fee_structures USING btree (class_id);

CREATE INDEX idx_fee_structures_session
    ON public.fee_structures USING btree (academic_session_id);

CREATE UNIQUE INDEX uq_active_fee_structure
    ON public.fee_structures USING btree (class_id, academic_session_id)
    WHERE (status = 'ACTIVE'::text);

CREATE INDEX idx_ledgers_student_id
    ON public.student_fee_ledgers USING btree (student_id);

CREATE INDEX idx_ledgers_session
    ON public.student_fee_ledgers USING btree (academic_session_id);

CREATE INDEX idx_adjustments_ledger
    ON public.ledger_adjustments USING btree (ledger_id);

CREATE INDEX idx_payments_ledger
    ON public.payments USING btree (ledger_id);

CREATE INDEX idx_payments_student
    ON public.payments USING btree (student_id);

CREATE INDEX idx_expenses_category
    ON public.expenses USING btree (category);

CREATE INDEX idx_expenses_expense_date
    ON public.expenses USING btree (expense_date);

CREATE INDEX idx_financial_audits_entity
    ON public.financial_audits USING btree (entity_type, entity_id);

CREATE INDEX idx_financial_audits_user
    ON public.financial_audits USING btree (performed_by);

CREATE INDEX idx_payments_created_at
ON public.payments (created_at);

CREATE UNIQUE INDEX uq_single_active_session
ON academic_sessions ((is_closed))
WHERE is_closed = false;

-- ------------------------------------------------------------
-- TRIGGERS
-- ------------------------------------------------------------

CREATE TRIGGER lock_base_components_after_payment
    BEFORE UPDATE OF base_components ON public.student_fee_ledgers
    FOR EACH ROW EXECUTE FUNCTION public.trg_lock_base_components();

-- ------------------------------------------------------------
-- VIEWS
-- ------------------------------------------------------------

CREATE VIEW public.ledger_summary AS
SELECT
    l.id AS ledger_id,
    l.student_id,
    l.class_id,
    s.name AS academic_year,
    s.is_closed,
    COALESCE(base.base_total, (0)::numeric) AS base_total,
    COALESCE(adj.adjustments_total, (0)::numeric) AS adjustments_total,
    COALESCE(pay.paid_total, (0)::numeric) AS paid_total
FROM public.student_fee_ledgers l
JOIN public.academic_sessions s
    ON s.id = l.academic_session_id
LEFT JOIN (
    SELECT l2.id AS ledger_id,
           sum(((c.value ->> 'amount'::text))::numeric) AS base_total
    FROM public.student_fee_ledgers l2,
         LATERAL jsonb_array_elements(l2.base_components) c(value)
    GROUP BY l2.id
) base ON base.ledger_id = l.id
LEFT JOIN (
    SELECT ledger_id,
           sum(amount) AS adjustments_total
    FROM public.ledger_adjustments
    GROUP BY ledger_id
) adj ON adj.ledger_id = l.id
LEFT JOIN (
    SELECT ledger_id,
           sum(amount) AS paid_total
    FROM public.payments
    GROUP BY ledger_id
) pay ON pay.ledger_id = l.id;

CREATE MATERIALIZED VIEW public.finance_monthly_summary AS
WITH sessions AS (
    SELECT name AS academic_year, start_date, end_date
    FROM public.academic_sessions
),
months AS (
    SELECT s.academic_year,
           generate_series(
               date_trunc('month', s.start_date::timestamp with time zone),
               date_trunc('month', s.end_date::timestamp with time zone),
               '1 mon'::interval
           ) AS month
    FROM sessions s
),
income AS (
    SELECT ls.academic_year,
           date_trunc('month', p.created_at) AS month,
           sum(p.amount) AS income_total
    FROM public.payments p
    JOIN public.ledger_summary ls ON ls.ledger_id = p.ledger_id
    GROUP BY ls.academic_year, date_trunc('month', p.created_at)
),
expense AS (
    SELECT s.academic_year,
           date_trunc('month', e.expense_date::timestamp with time zone) AS month,
           sum(e.amount) AS expense_total
    FROM public.expenses e
    JOIN sessions s ON e.expense_date >= s.start_date AND e.expense_date <= s.end_date
    GROUP BY s.academic_year, date_trunc('month', e.expense_date::timestamp with time zone)
)
SELECT
    m.academic_year,
    m.month,
    COALESCE(i.income_total, (0)::numeric) AS income_total,
    COALESCE(e.expense_total, (0)::numeric) AS expense_total,
    COALESCE(i.income_total, (0)::numeric) - COALESCE(e.expense_total, (0)::numeric) AS net_total
FROM months m
LEFT JOIN income i ON m.academic_year = i.academic_year AND m.month = i.month
LEFT JOIN expense e ON m.academic_year = e.academic_year AND m.month = e.month
ORDER BY m.academic_year, m.month
WITH NO DATA;