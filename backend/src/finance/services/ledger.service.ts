import { getPool } from "../../config/postgres";
import type {
    AcademicSessionRow,
    LedgerRow,
    LedgerSummaryRow,
    AdjustmentRow,
    PaymentRow,
} from "../types";

// ---------------------------------------------------------------------------
// Academic Sessions
// ---------------------------------------------------------------------------

/**
 * Returns all academic sessions ordered by start_date descending (most recent first).
 */
export async function getAllSessions(): Promise<AcademicSessionRow[]> {
    const { rows } = await getPool().query<AcademicSessionRow>(
        `SELECT id, name, start_date, end_date, is_closed, closed_at, created_at
     FROM   academic_sessions
     ORDER  BY start_date DESC`
    );
    return rows;
}

/**
 * Returns a single academic session by name (e.g. '2025-26').
 * Returns null if not found — callers decide whether to 404.
 */
export async function getSessionByName(
    name: string
): Promise<AcademicSessionRow | null> {
    const { rows } = await getPool().query<AcademicSessionRow>(
        `SELECT id, name, start_date, end_date, is_closed, closed_at, created_at
     FROM   academic_sessions
     WHERE  name = $1`,
        [name]
    );
    return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Ledgers
// ---------------------------------------------------------------------------

/**
 * Returns the ledger summary for a student in a given academic year (by name).
 * Returns null if not found — callers decide whether to 404.
 */
export async function getLedgerSummaryByStudentAndYear(
    studentId: string,
    year: string
): Promise<LedgerSummaryRow | null> {
    const { rows } = await getPool().query<LedgerSummaryRow>(
        `SELECT ls.ledger_id, ls.student_id, ls.class_id,
            ls.academic_year, ls.is_closed,
            ls.base_total, ls.adjustments_total, ls.paid_total
     FROM   ledger_summary ls
     WHERE  ls.student_id  = $1
       AND  ls.academic_year = $2`,
        [studentId, year]
    );
    return rows[0] ?? null;
}

/**
 * Returns a full ledger row (with base_components) by ledger UUID.
 * Returns null if not found.
 */
export async function getLedgerById(
    ledgerId: string
): Promise<LedgerRow | null> {
    const { rows } = await getPool().query<LedgerRow>(
        `SELECT id, student_id, class_id, academic_session_id,
            base_components, created_at
     FROM   student_fee_ledgers
     WHERE  id = $1`,
        [ledgerId]
    );
    return rows[0] ?? null;
}

/**
 * Returns the summary view row for a specific ledger UUID.
 * Returns null if not found.
 */
export async function getLedgerSummaryById(
    ledgerId: string
): Promise<LedgerSummaryRow | null> {
    const { rows } = await getPool().query<LedgerSummaryRow>(
        `SELECT ledger_id, student_id, class_id,
            academic_year, is_closed,
            base_total, adjustments_total, paid_total
     FROM   ledger_summary
     WHERE  ledger_id = $1`,
        [ledgerId]
    );
    return rows[0] ?? null;
}

/**
 * Returns all adjustments for a ledger, ordered by created_at ascending.
 */
export async function getAdjustmentsByLedger(
    ledgerId: string
): Promise<AdjustmentRow[]> {
    const { rows } = await getPool().query<AdjustmentRow>(
        `SELECT id, ledger_id, type, amount, reason, approved_by, created_at
     FROM   ledger_adjustments
     WHERE  ledger_id = $1
     ORDER  BY created_at ASC`,
        [ledgerId]
    );
    return rows;
}

/**
 * Returns all payments for a ledger, ordered by created_at ascending.
 */
export async function getPaymentsByLedger(
    ledgerId: string
): Promise<PaymentRow[]> {
    const { rows } = await getPool().query<PaymentRow>(
        `SELECT id, ledger_id, student_id, amount, mode,
            reference, collected_by, created_at
     FROM   payments
     WHERE  ledger_id = $1
     ORDER  BY created_at ASC`,
        [ledgerId]
    );
    return rows;
}

// ---------------------------------------------------------------------------
// Receipts (payments per student across all ledgers)
// ---------------------------------------------------------------------------

/**
 * Returns all payments for a student across all their ledgers,
 * ordered by created_at descending (most recent receipt first).
 */
export async function getReceiptsByStudent(
    studentId: string
): Promise<PaymentRow[]> {
    const { rows } = await getPool().query<PaymentRow>(
        `SELECT id, ledger_id, student_id, amount, mode,
            reference, collected_by, created_at
     FROM   payments
     WHERE  student_id = $1
     ORDER  BY created_at DESC`,
        [studentId]
    );
    return rows;
}
