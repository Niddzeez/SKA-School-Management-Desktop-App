import { getPool } from "../../config/postgres";
import Decimal from "decimal.js";

export interface ReplayDiagnostic {
    ledgerId: string;
    recomputed: {
        baseTotal: number;
        adjustmentsTotal: number;
        finalFee: number;
        paidTotal: number;
        pending: number;
    };
    stored: {
        baseTotal: number;
        adjustmentsTotal: number;
        finalFee: number;
        paidTotal: number;
        pending: number;
    };
    match: boolean;
    differences?: string[];
}

export async function runLedgerReplay(ledgerId: string): Promise<ReplayDiagnostic> {

    const pool = getPool();

    /* -----------------------------
       1. Fetch base components
    ----------------------------- */

    const ledgerRes = await pool.query<{ base_components: any }>(
        `SELECT base_components FROM student_fee_ledgers WHERE id = $1`,
        [ledgerId]
    );

    if (ledgerRes.rows.length === 0) {
        throw new Error(`Ledger ${ledgerId} not found`);
    }

    const baseComponents: { name: string; amount: string | number }[] =
        ledgerRes.rows[0].base_components;

    let baseTotal = new Decimal(0);

    for (const comp of baseComponents) {
        baseTotal = baseTotal.plus(new Decimal(comp.amount));
    }

    /* -----------------------------
       2. Adjustments
    ----------------------------- */

    const adjRes = await pool.query<{ amount: string }>(
        `SELECT amount FROM ledger_adjustments
         WHERE ledger_id = $1
         ORDER BY created_at`,
        [ledgerId]
    );

    let adjustmentsTotal = new Decimal(0);

    for (const row of adjRes.rows) {
        adjustmentsTotal = adjustmentsTotal.plus(new Decimal(row.amount));
    }

    /* -----------------------------
       3. Payments
    ----------------------------- */

    const payRes = await pool.query<{ amount: string }>(
        `SELECT amount FROM payments
         WHERE ledger_id = $1
         ORDER BY created_at`,
        [ledgerId]
    );

    let paidTotal = new Decimal(0);

    for (const row of payRes.rows) {
        paidTotal = paidTotal.plus(new Decimal(row.amount));
    }

    /* -----------------------------
       4. Compute totals
    ----------------------------- */

    const finalFee = baseTotal.plus(adjustmentsTotal);
    const pending = finalFee.minus(paidTotal);

    const recomputed = {
        baseTotal: baseTotal.toNumber(),
        adjustmentsTotal: adjustmentsTotal.toNumber(),
        finalFee: finalFee.toNumber(),
        paidTotal: paidTotal.toNumber(),
        pending: pending.toNumber()
    };

    /* -----------------------------
       5. Fetch stored summary
    ----------------------------- */

    const summaryRes = await pool.query<{
        base_total: string;
        adjustments_total: string;
        paid_total: string;
    }>(
        `SELECT base_total, adjustments_total, paid_total
         FROM ledger_summary
         WHERE ledger_id = $1`,
        [ledgerId]
    );

    let storedObj: ReplayDiagnostic["stored"];

    if (summaryRes.rows.length === 0) {

        storedObj = {
            baseTotal: 0,
            adjustmentsTotal: 0,
            finalFee: 0,
            paidTotal: 0,
            pending: 0
        };

    } else {

        const row = summaryRes.rows[0];

        const sBase = new Decimal(row.base_total);
        const sAdj = new Decimal(row.adjustments_total);
        const sPaid = new Decimal(row.paid_total);

        const sFinal = sBase.plus(sAdj);
        const sPending = sFinal.minus(sPaid);

        storedObj = {
            baseTotal: sBase.toNumber(),
            adjustmentsTotal: sAdj.toNumber(),
            finalFee: sFinal.toNumber(),
            paidTotal: sPaid.toNumber(),
            pending: sPending.toNumber()
        };
    }

    /* -----------------------------
       6. Compare results
    ----------------------------- */

    const differences: string[] = [];

    if (recomputed.baseTotal !== storedObj.baseTotal) differences.push("baseTotal mismatch");
    if (recomputed.adjustmentsTotal !== storedObj.adjustmentsTotal) differences.push("adjustmentsTotal mismatch");
    if (recomputed.finalFee !== storedObj.finalFee) differences.push("finalFee mismatch");
    if (recomputed.paidTotal !== storedObj.paidTotal) differences.push("paidTotal mismatch");
    if (recomputed.pending !== storedObj.pending) differences.push("pending mismatch");

    return {
        ledgerId,
        recomputed,
        stored: storedObj,
        match: differences.length === 0,
        ...(differences.length > 0 && { differences })
    };
}