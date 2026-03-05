/**
 * Finance subsystem — internal TypeScript types.
 *
 * These mirror the shapes of PostgreSQL rows returned by pg queries.
 * They are NOT the public API types; mappers convert them into the
 * frontend-compatible shapes defined in the frontend types/ directory.
 */

// ---------------------------------------------------------------------------
// Postgres row types (what pg returns)
// ---------------------------------------------------------------------------

export interface AcademicSessionRow {
    id: string;
    name: string;             // '2025-26'
    start_date: Date;
    end_date: Date;
    is_closed: boolean;
    closed_at: Date | null;
    created_at: Date;
}

export interface LedgerRow {
    id: string;
    student_id: string;
    class_id: string;
    academic_session_id: string;
    base_components: FeeComponentSnapshotRow[];
    created_at: Date;
}

export interface LedgerSummaryRow {
    ledger_id: string;
    student_id: string;
    class_id: string;
    academic_year: string;
    is_closed: boolean;
    base_total: string;         // NUMERIC comes back as string from pg
    adjustments_total: string;
    paid_total: string;
}

export interface AdjustmentRow {
    id: string;
    ledger_id: string;
    type: 'DISCOUNT' | 'CONCESSION' | 'WAIVER' | 'EXTRA' | 'LATE_FEE';
    amount: string;             // NUMERIC
    reason: string;
    approved_by: string;
    created_at: Date;
}

export interface PaymentRow {
    id: string;
    ledger_id: string;
    student_id: string;
    amount: string;             // NUMERIC
    mode: 'CASH' | 'UPI' | 'BANK' | 'CARD' | 'CHEQUE';
    reference: string | null;
    collected_by: string;
    created_at: Date;
}

export interface ExpenseRow {
    id: string;
    category: 'SALARY' | 'UTILITY' | 'MAINTENANCE' | 'PURCHASE' | 'OTHER';
    description: string;
    amount: string;             // NUMERIC
    expense_date: Date;
    paid_to: string;
    mode: 'CASH' | 'BANK' | 'UPI';
    recorded_by: string;
    reference: string | null;
    recorded_at: Date;
}

// ---------------------------------------------------------------------------
// JSONB sub-types
// ---------------------------------------------------------------------------

export interface FeeComponentSnapshotRow {
    name: string;
    amount: number;
}
