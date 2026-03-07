import { getPool, withTransaction } from "../../config/postgres";
import type {
    AcademicSessionRow,
    FeeComponentSnapshotRow,
    LedgerRow,
    LedgerSummaryRow,
    AdjustmentRow,
    PaymentRow,
} from "../types";
import {
    ConflictError,
    NotFoundError,
    UnprocessableError,
} from "../../shared/error";
import type { AdjustmentType, PaymentMode } from "../../shared/validators";
import { logFinancialEvent } from "../audit/audit.service";

// ===========================================================================
// READ OPERATIONS (Phase 4)
// ===========================================================================

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

/**
 * Closes an academic session by ID.
 */
export async function closeAcademicYear(
    id: string
): Promise<AcademicSessionRow> {
    const { rows } = await getPool().query<AcademicSessionRow>(
        `UPDATE academic_sessions
         SET is_closed = true, closed_at = NOW()
         WHERE id = $1
         RETURNING id, name, start_date, end_date, is_closed, closed_at, created_at`,
        [id]
    );
    if (rows.length === 0) {
        throw new NotFoundError("Academic session", id);
    }
    return rows[0];
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

/**
 * Returns a complete ledger detail containing the summary, base components,
 * adjustments, and payments in a single database roundtrip.
 */
export interface FullLedgerRow extends LedgerSummaryRow {
    base_components: FeeComponentSnapshotRow[];
    created_at: Date;
    adjustments: AdjustmentRow[];
    payments: PaymentRow[];
}

export async function getFullLedgerById(
    ledgerId: string
): Promise<FullLedgerRow | null> {
    const { rows } = await getPool().query(`
        SELECT 
            ls.ledger_id, ls.student_id, ls.class_id,
            ls.academic_year, ls.is_closed,
            ls.base_total, ls.adjustments_total, ls.paid_total,
            sfl.base_components, sfl.created_at,
            COALESCE(
                (SELECT json_agg(json_build_object(
                    'id', la.id,
                    'ledger_id', la.ledger_id,
                    'type', la.type,
                    'amount', la.amount,
                    'reason', la.reason,
                    'approved_by', la.approved_by,
                    'created_at', la.created_at
                ) ORDER BY la.created_at ASC)
                FROM ledger_adjustments la WHERE la.ledger_id = sfl.id),
                '[]'::json
            ) AS adjustments,
            COALESCE(
                (SELECT json_agg(json_build_object(
                    'id', p.id,
                    'ledger_id', p.ledger_id,
                    'student_id', p.student_id,
                    'amount', p.amount,
                    'mode', p.mode,
                    'reference', p.reference,
                    'collected_by', p.collected_by,
                    'created_at', p.created_at
                ) ORDER BY p.created_at ASC)
                FROM payments p WHERE p.ledger_id = sfl.id),
                '[]'::json
            ) AS payments
        FROM student_fee_ledgers sfl
        JOIN ledger_summary ls ON ls.ledger_id = sfl.id
        WHERE sfl.id = $1
    `, [ledgerId]);

    return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Receipts (payments per student across all ledgers)
// ---------------------------------------------------------------------------

/**
 * Returns all payments for a student across all their ledgers,
 * ordered by created_at descending (most recent receipt first).
 */
export async function getReceiptsByStudent(
    studentId: string,
    limitParam?: number,
    offsetParam?: number
): Promise<PaymentRow[]> {
    const limit = limitParam ? Math.min(Math.max(1, limitParam), 100) : 50;
    const offset = offsetParam ? Math.max(0, offsetParam) : 0;

    const { rows } = await getPool().query<PaymentRow>(
        `SELECT id, ledger_id, student_id, amount, mode,
            reference, collected_by, created_at
     FROM   payments
     WHERE  student_id = $1
     ORDER  BY created_at DESC
     LIMIT  $2
     OFFSET $3`,
        [studentId, limit, offset]
    );
    return rows;
}

// ===========================================================================
// WRITE OPERATIONS (Phase 5)
// ===========================================================================

// ---------------------------------------------------------------------------
// Create Ledger
// ---------------------------------------------------------------------------

/**
 * Creates a new student fee ledger for a given academic session.
 *
 * Business rules enforced:
 *   - Academic session must exist and NOT be closed
 *   - One ledger per student per academic year (DB unique constraint)
 */
export async function createLedger(
    studentId: string,
    classId: string,
    academicSessionId: string,
    baseComponents: FeeComponentSnapshotRow[],
    performedBy: string
): Promise<LedgerRow> {
    const result = await withTransaction(async (client) => {
        // Verify the academic session exists and is open
        const { rows: sessions } = await client.query<AcademicSessionRow>(
            `SELECT id, name, is_closed
             FROM   academic_sessions
             WHERE  id = $1`,
            [academicSessionId]
        );

        if (sessions.length === 0) {
            throw new NotFoundError("Academic session", academicSessionId);
        }
        if (sessions[0].is_closed) {
            throw new UnprocessableError(
                `Academic year '${sessions[0].name}' is closed. Cannot create new ledgers.`
            );
        }

        // Insert the ledger
        try {
            const { rows } = await client.query<LedgerRow>(
                `INSERT INTO student_fee_ledgers
                     (student_id, class_id, academic_session_id, base_components)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, student_id, class_id, academic_session_id,
                           base_components, created_at`,
                [studentId, classId, academicSessionId, JSON.stringify(baseComponents)]
            );
            return rows[0];
        } catch (err: unknown) {
            // Unique violation: one ledger per student per academic year
            if (
                typeof err === "object" && err !== null &&
                "code" in err && (err as { code: string }).code === "23505"
            ) {
                throw new ConflictError(
                    `A ledger already exists for this student in academic session '${sessions[0].name}'`
                );
            }
            throw err;
        }
    });

    await logFinancialEvent(
        "LEDGER_CREATED",
        "STUDENT_FEE_LEDGER",
        result.id,
        performedBy,
        { studentId, classId, academicSessionId }
    );

    return result;
}

// ---------------------------------------------------------------------------
// Add Payment
// ---------------------------------------------------------------------------

/**
 * Records a payment against a ledger.
 *
 * Business rules:
 *   - Ledger must exist (locked via SELECT FOR UPDATE)
 *   - Payments are allowed even if the academic year is closed
 *   - student_id is denormalised from the ledger row
 */
export async function addPayment(
    ledgerId: string,
    amount: number,
    mode: PaymentMode,
    collectedBy: string,
    performedBy: string,
    reference?: string
): Promise<PaymentRow> {
    const result = await withTransaction(async (client) => {
        // Lock the ledger row and read student_id
        const { rows: ledgers } = await client.query<LedgerRow>(
            `SELECT id, student_id
             FROM   student_fee_ledgers
             WHERE  id = $1
             FOR UPDATE`,
            [ledgerId]
        );

        if (ledgers.length === 0) {
            throw new NotFoundError("Ledger", ledgerId);
        }

        const studentId = ledgers[0].student_id;

        const { rows } = await client.query<PaymentRow>(
            `INSERT INTO payments
                 (ledger_id, student_id, amount, mode, collected_by, reference)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, ledger_id, student_id, amount, mode,
                       reference, collected_by, created_at`,
            [ledgerId, studentId, amount, mode, collectedBy, reference ?? null]
        );
        return rows[0];
    });

    await logFinancialEvent(
        "PAYMENT_RECORDED",
        "PAYMENT",
        result.id,
        performedBy,
        { ledgerId, studentId: result.student_id, amount, mode, collectedBy, reference }
    );

    return result;
}

// ---------------------------------------------------------------------------
// Add Adjustment
// ---------------------------------------------------------------------------

/**
 * Adds a fee adjustment to a ledger.
 *
 * Business rules:
 *   - Ledger must exist
 *   - Academic year must NOT be closed
 *   - Amount sign is validated by the DB CHECK constraint
 */
export async function addAdjustment(
    ledgerId: string,
    type: AdjustmentType,
    amount: number,
    reason: string,
    approvedBy: string,
    performedBy: string
): Promise<AdjustmentRow> {
    const result = await withTransaction(async (client) => {
        // Verify ledger exists and academic year is open
        const { rows: ledgers } = await client.query<{
            id: string;
            academic_year_name: string;
            is_closed: boolean;
        }>(
            `SELECT sfl.id,
                    acs.name AS academic_year_name,
                    acs.is_closed
             FROM   student_fee_ledgers sfl
             JOIN   academic_sessions  acs ON acs.id = sfl.academic_session_id
             WHERE  sfl.id = $1
             FOR UPDATE OF sfl`,
            [ledgerId]
        );

        if (ledgers.length === 0) {
            throw new NotFoundError("Ledger", ledgerId);
        }
        if (ledgers[0].is_closed) {
            throw new UnprocessableError(
                `Academic year '${ledgers[0].academic_year_name}' is closed. Cannot add adjustments.`
            );
        }

        const { rows } = await client.query<AdjustmentRow>(
            `INSERT INTO ledger_adjustments
                 (ledger_id, type, amount, reason, approved_by)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, ledger_id, type, amount, reason, approved_by, created_at`,
            [ledgerId, type, amount, reason, approvedBy]
        );
        return rows[0];
    });

    await logFinancialEvent(
        "ADJUSTMENT_ADDED",
        "LEDGER_ADJUSTMENT",
        result.id,
        performedBy,
        { ledgerId, type, amount, reason, approvedBy }
    );

    return result;
}

// ---------------------------------------------------------------------------
// Update Ledger Base Components
// ---------------------------------------------------------------------------

/**
 * Updates the base components of a ledger.
 *
 * Business rules:
 *   - Ledger must exist
 *   - paid_total must be 0
 */
export async function updateLedgerBaseComponents(
    ledgerId: string,
    baseComponents: FeeComponentSnapshotRow[],
    performedBy: string
): Promise<LedgerRow> {
    const result = await withTransaction(async (client) => {
        const { rows: ledgers } = await client.query<{
            id: string;
            paid_total: string | number;
        }>(
            `SELECT sfl.id, ls.paid_total
             FROM student_fee_ledgers sfl
             JOIN ledger_summary ls ON ls.ledger_id = sfl.id
             WHERE sfl.id = $1
             FOR UPDATE OF sfl`,
            [ledgerId]
        );

        if (ledgers.length === 0) {
            throw new NotFoundError("Ledger", ledgerId);
        }

        const paidTotal = typeof ledgers[0].paid_total === 'string' ? parseFloat(ledgers[0].paid_total) : ledgers[0].paid_total;
        if (paidTotal > 0) {
            throw new ConflictError("Ledger cannot be modified after payments are recorded");
        }

        const { rows } = await client.query<LedgerRow>(
            `UPDATE student_fee_ledgers
             SET base_components = $1
             WHERE id = $2
             RETURNING id, student_id, class_id, academic_session_id, base_components, created_at`,
            [JSON.stringify(baseComponents), ledgerId]
        );
        return rows[0];
    });

    await logFinancialEvent(
        "LEDGER_BASE_COMPONENTS_UPDATED",
        "STUDENT_FEE_LEDGER",
        result.id,
        performedBy,
        { ledgerId, baseComponents }
    );

    return result;
}
