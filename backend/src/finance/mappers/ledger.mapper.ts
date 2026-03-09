import type {
    LedgerSummaryRow,
    LedgerRow,
    AdjustmentRow,
    PaymentRow,
} from "../types";

/**
 * Maps a ledger_summary view row to the frontend LedgerSummary shape.
 * This is used for list/query endpoints (GET /api/ledgers?studentId=&year=).
 */
export const mapLedgerSummary = (row: LedgerSummaryRow) => {
    const baseTotal = Number(row.base_total);
    const adjustmentsTotal = Number(row.adjustments_total);
    const paidTotal = Number(row.paid_total);
    const finalFee = baseTotal + adjustmentsTotal;
    const pending = finalFee - paidTotal;

    return {
        id: row.ledger_id,         // Added for frontend StudentFeeLedger compatibility
        ledgerId: row.ledger_id,
        studentId: row.student_id,
        classId: row.class_id,
        academicSessionId: row.academic_year, // Added for frontend StudentFeeLedger compatibility
        academicYear: row.academic_year,
        isClosed: row.is_closed,
        baseTotal,
        adjustmentsTotal,
        paidTotal,
        finalFee,
        pending,
        status: pending <= 0 ? "PAID" as const
            : paidTotal > 0 ? "PARTIAL" as const
                : "PENDING" as const,
    };
};

/**
 * Maps a raw student_fee_ledgers row to the frontend StudentFeeLedger shape.
 * Used for the full ledger detail endpoint (GET /api/ledgers/:id).
 */
export const mapLedger = (row: LedgerRow) => ({
    id: row.id,
    studentId: row.student_id,
    classId: row.class_id,
    academicYear: row.academic_session_id,   // joined as name upstream when needed
    baseComponents: row.base_components,        // already parsed JSONB array
    createdAt: row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
});

/**
 * Maps a ledger_adjustments row to the frontend LedgerAdjustment shape.
 */
export const mapAdjustment = (row: AdjustmentRow) => ({
    id: row.id,
    ledgerId: row.ledger_id,
    type: row.type,
    amount: Number(row.amount),
    reason: row.reason,
    approvedBy: row.approved_by,
    createdAt: row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
});

/**
 * Maps a payments row to the frontend Payment shape.
 */
export const mapPayment = (row: PaymentRow) => ({
    id: row.id,
    ledgerId: row.ledger_id,
    studentId: row.student_id,
    amount: Number(row.amount),
    mode: row.mode,
    reference: row.reference ?? undefined,
    collectedBy: row.collected_by,
    createdAt: row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
});
