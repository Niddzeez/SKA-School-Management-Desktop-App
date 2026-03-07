import { getPool } from "../../config/postgres";

export interface ConsistencyReport {
    status: "OK" | "ISSUES_FOUND";
    totalLedgersChecked: number;
    issues: {
        baseTotalMismatch: Array<{ ledgerId: string; expectedTotal: number; actualTotal: number }>;
        negativeBalances: Array<{ ledgerId: string; balance: number }>;
        duplicatePayments: Array<{ ledgerId: string; amount: number; duplicateCount: number }>;
        overpaidLedgers: Array<{ ledgerId: string; paidTotal: number; finalFee: number }>;
        invalidAdjustments: Array<{ ledgerId: string; adjustmentsTotal: number; baseTotal: number }>;
        orphanPayments: Array<{ paymentId: string; ledgerId: string }>;
    };
}

export async function runFinanceConsistencyCheck(): Promise<ConsistencyReport> {
    const pool = getPool();
    const report: ConsistencyReport = {
        status: "OK",
        totalLedgersChecked: 0,
        issues: {
            baseTotalMismatch: [],
            negativeBalances: [],
            duplicatePayments: [],
            overpaidLedgers: [],
            invalidAdjustments: [],
            orphanPayments: [],
        },
    };

    try {
        // Total ledgers count
        const countRes = await pool.query<{ count: string }>(`SELECT COUNT(*) FROM student_fee_ledgers`);
        report.totalLedgersChecked = parseInt(countRes.rows[0].count, 10);

        // CHECK 1: Base Total Integrity
        // Sum of components inside JSONB vs ledger_summary base_total
        const baseTotalRes = await pool.query<{
            ledger_id: string;
            computed_total: number;
            actual_total: number;
        }>(`
      WITH computed AS (
        SELECT id as ledger_id, COALESCE(SUM(CAST(component->>'amount' AS numeric)), 0) as computed_total
        FROM student_fee_ledgers, jsonb_array_elements(base_components) as component
        GROUP BY id
      )
      SELECT c.ledger_id, c.computed_total, ls.base_total as actual_total
      FROM computed c
      JOIN ledger_summary ls ON ls.ledger_id = c.ledger_id
      WHERE c.computed_total != ls.base_total
    `);

        report.issues.baseTotalMismatch = baseTotalRes.rows.map(r => ({
            ledgerId: r.ledger_id,
            expectedTotal: Number(r.computed_total),
            actualTotal: Number(r.actual_total)
        }));

        // CHECK 2: Negative Ledger Balance
        const negativeBalanceRes = await pool.query<{ ledger_id: string; pending: number }>(`
      SELECT ledger_id, (base_total + adjustments_total - paid_total) as pending
      FROM ledger_summary
      WHERE (base_total + adjustments_total - paid_total) < 0
    `);

        report.issues.negativeBalances = negativeBalanceRes.rows.map(r => ({
            ledgerId: r.ledger_id,
            balance: Number(r.pending)
        }));

        // CHECK 3: Duplicate Payments
        // We check for exact same ledgerId, amount, and timestamp (using hour truncation as heuristic)
        // Actually prompt said "same timestamp", let's be strict and use exact timestamp or minute truncate.
        // "Check payments table for duplicate payment IDs or suspicious duplicates. same ledgerId, same amount, same timestamp"
        const duplicatePaymentsRes = await pool.query<{ ledger_id: string; amount: number; dup_count: number }>(`
      SELECT ledger_id, amount, DATE_TRUNC('minute', created_at) as minute, COUNT(*) as dup_count
      FROM payments
      GROUP BY ledger_id, amount, DATE_TRUNC('minute', created_at)
      HAVING COUNT(*) > 1
    `);

        report.issues.duplicatePayments = duplicatePaymentsRes.rows.map(r => ({
            ledgerId: r.ledger_id,
            amount: Number(r.amount),
            duplicateCount: Number(r.dup_count)
        }));

        // CHECK 4: Payment Exceeds Final Fee
        const overpaidRes = await pool.query<{ ledger_id: string; paid_total: number; final_fee: number }>(`
      SELECT ledger_id, paid_total, (base_total + adjustments_total) as final_fee
      FROM ledger_summary
      WHERE paid_total > (base_total + adjustments_total)
    `);
        report.issues.overpaidLedgers = overpaidRes.rows.map(r => ({
            ledgerId: r.ledger_id,
            paidTotal: Number(r.paid_total),
            finalFee: Number(r.final_fee)
        }));

        // CHECK 5: Adjustment Violations (adjustments > baseTotal)
        // Using absolute value to ensure negative adjustments (discounts) don't exceed base fee either
        const invalidAdjRes = await pool.query<{ ledger_id: string; adjustments_total: number; base_total: number }>(`
      SELECT ledger_id, adjustments_total, base_total
      FROM ledger_summary
      WHERE ABS(adjustments_total) > base_total
    `);
        report.issues.invalidAdjustments = invalidAdjRes.rows.map(r => ({
            ledgerId: r.ledger_id,
            adjustmentsTotal: Number(r.adjustments_total),
            baseTotal: Number(r.base_total)
        }));

        // CHECK 6: Orphan Payments (payments without matching ledger)
        const orphanRes = await pool.query<{ id: string; ledger_id: string }>(`
      SELECT id, ledger_id
      FROM payments p
      WHERE NOT EXISTS (SELECT 1 FROM student_fee_ledgers sfl WHERE sfl.id = p.ledger_id)
    `);
        report.issues.orphanPayments = orphanRes.rows.map(r => ({
            paymentId: r.id,
            ledgerId: r.ledger_id
        }));

        // Final Status Check
        const hasIssues = Object.values(report.issues).some(arr => arr.length > 0);
        if (hasIssues) {
            report.status = "ISSUES_FOUND";
        }

    } catch (error) {
        console.error("Finance Consistency Check failed:", error);
        throw error;
    }

    return report;
}
