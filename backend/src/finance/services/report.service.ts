import { getPool } from "../../config/postgres";

// ---------------------------------------------------------------------------
// Report row types
// ---------------------------------------------------------------------------

export interface CollectionSummaryRow {
    total_fees: string;       // NUMERIC as string from pg
    total_collected: string;
    total_pending: string;
    total_adjustments: string;
    ledger_count: string;     // bigint comes as string
}

export interface ClassDuesRow {
    class_id: string;
    student_count: string;    // bigint
    total_pending: string;    // NUMERIC
}

export interface PaymentHistoryRow {
    id: string;
    ledger_id: string;
    student_id: string;
    amount: string;           // NUMERIC
    mode: string;
    collected_by: string;
    reference: string | null;
    created_at: Date;
}

// ---------------------------------------------------------------------------
// Collection Summary
// ---------------------------------------------------------------------------

/**
 * Returns aggregate financial totals for a given academic year.
 * All values are derived from the ledger_summary view.
 */
export async function getCollectionSummary(
    year: string
): Promise<CollectionSummaryRow | null> {
    const { rows } = await getPool().query<CollectionSummaryRow>(
        `SELECT
            COALESCE(SUM(base_total + adjustments_total), 0) AS total_fees,
            COALESCE(SUM(paid_total), 0)                     AS total_collected,
            COALESCE(SUM(base_total + adjustments_total - paid_total), 0) AS total_pending,
            COALESCE(SUM(adjustments_total), 0)              AS total_adjustments,
            COUNT(*)                                         AS ledger_count
         FROM ledger_summary
         WHERE academic_year = $1`,
        [year]
    );
    // COUNT always returns a row, but ledger_count will be '0' if no data
    return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Class-wise Dues
// ---------------------------------------------------------------------------

/**
 * Returns pending dues grouped by class_id for a given academic year.
 * Class names must be resolved via identity-lookup at the route layer.
 */
export async function getClassWiseDues(
    year: string
): Promise<ClassDuesRow[]> {
    const { rows } = await getPool().query<ClassDuesRow>(
        `SELECT
            class_id,
            COUNT(*)                                                  AS student_count,
            COALESCE(SUM(base_total + adjustments_total - paid_total), 0) AS total_pending
         FROM ledger_summary
         WHERE academic_year = $1
         GROUP BY class_id
         ORDER BY total_pending DESC`,
        [year]
    );
    return rows;
}

// ---------------------------------------------------------------------------
// Payment History
// ---------------------------------------------------------------------------

export interface PaymentHistoryFilters {
    year: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    offset?: number;
}

/**
 * Returns paginated payment history for a given academic year.
 * Optionally filtered by date range.
 */
export async function getPaymentHistory(
    filters: PaymentHistoryFilters
): Promise<PaymentHistoryRow[]> {
    const conditions: string[] = ["ls.academic_year = $1"];
    const params: unknown[] = [filters.year];

    if (filters.fromDate) {
        params.push(filters.fromDate);
        conditions.push(`p.created_at >= $${params.length}::date`);
    }
    if (filters.toDate) {
        params.push(filters.toDate);
        conditions.push(`p.created_at < ($${params.length}::date + interval '1 day')`);
    }

    const limit = filters.limit ? Math.min(Math.max(1, filters.limit), 100) : 50;
    const offset = filters.offset ? Math.max(0, filters.offset) : 0;

    params.push(limit);
    const limitIdx = params.length;
    params.push(offset);
    const offsetIdx = params.length;

    const { rows } = await getPool().query<PaymentHistoryRow>(
        `SELECT
            p.id, p.ledger_id, p.student_id, p.amount,
            p.mode, p.collected_by, p.reference, p.created_at
         FROM payments p
         JOIN ledger_summary ls ON ls.ledger_id = p.ledger_id
         WHERE ${conditions.join(" AND ")}
         ORDER BY p.created_at DESC
         LIMIT $${limitIdx}
         OFFSET $${offsetIdx}`,
        params
    );
    return rows;
}

// ---------------------------------------------------------------------------
// Receipt lookup (Phase 7)
// ---------------------------------------------------------------------------

export interface ReceiptDataRow {
    payment_id: string;
    ledger_id: string;
    student_id: string;
    amount: string;
    mode: string;
    reference: string | null;
    collected_by: string;
    created_at: Date;
    academic_year: string;
    class_id: string;
    receipt_seq: string;      // row_number as string (bigint)
}

/**
 * Returns payment data enriched with academic year and a deterministic
 * receipt sequence number based on payment ordering within the year.
 */
export async function getReceiptData(
    paymentId: string
): Promise<ReceiptDataRow | null> {
    const { rows } = await getPool().query<ReceiptDataRow>(
        `WITH numbered AS (
            SELECT
                p.id            AS payment_id,
                p.ledger_id,
                p.student_id,
                p.amount,
                p.mode,
                p.reference,
                p.collected_by,
                p.created_at,
                ls.academic_year,
                ls.class_id,
                ROW_NUMBER() OVER (
                    PARTITION BY ls.academic_year
                    ORDER BY p.created_at ASC, p.id ASC
                ) AS receipt_seq
            FROM payments p
            JOIN ledger_summary ls ON ls.ledger_id = p.ledger_id
         )
         SELECT * FROM numbered WHERE payment_id = $1`,
        [paymentId]
    );
    return rows[0] ?? null;
}
