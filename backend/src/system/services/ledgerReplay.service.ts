import { getPool } from "../../config/postgres";

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

    // 1. Fetch historical components
    const ledgerRes = await pool.query<{ base_components: any }>(
        `SELECT base_components FROM student_fee_ledgers WHERE id = $1`,
        [ledgerId]
    );
    if (ledgerRes.rows.length === 0) {
        throw new Error(`Ledger ${ledgerId} not found`);
    }

    const baseComponents: { name: string; amount: string | number }[] = ledgerRes.rows[0].base_components;
    const baseTotal = baseComponents.reduce((sum, comp) => sum + Number(comp.amount), 0);

    // 2. Adjustments
    const adjRes = await pool.query<{ amount: string }>(
        `SELECT amount FROM ledger_adjustments WHERE ledger_id = $1 ORDER BY created_at`,
        [ledgerId]
    );
    const adjustmentsTotal = adjRes.rows.reduce((sum, row) => sum + Number(row.amount), 0);

    // 3. Payments
    const payRes = await pool.query<{ amount: string }>(
        `SELECT amount FROM payments WHERE ledger_id = $1 ORDER BY created_at`,
        [ledgerId]
    );
    const paidTotal = payRes.rows.reduce((sum, row) => sum + Number(row.amount), 0);

    // 4. Compute standard math
    const finalFee = baseTotal + adjustmentsTotal;
    const pending = finalFee - paidTotal;

    const recomputed = { baseTotal, adjustmentsTotal, finalFee, paidTotal, pending };

    // 5. Fetch official ledger_summary
    const summaryRes = await pool.query<{
        base_total: string;
        adjustments_total: string;
        paid_total: string;
    }>(
        `SELECT base_total, adjustments_total, paid_total 
     FROM ledger_summary WHERE ledger_id = $1`,
        [ledgerId]
    );

    let storedObj: ReplayDiagnostic["stored"];
    if (summaryRes.rows.length === 0) {
        storedObj = { baseTotal: 0, adjustmentsTotal: 0, finalFee: 0, paidTotal: 0, pending: 0 };
    } else {
        const row = summaryRes.rows[0];
        const sBase = Number(row.base_total);
        const sAdj = Number(row.adjustments_total);
        const sPaid = Number(row.paid_total);
        const sFinal = sBase + sAdj;
        const sPending = sFinal - sPaid;
        storedObj = { baseTotal: sBase, adjustmentsTotal: sAdj, finalFee: sFinal, paidTotal: sPaid, pending: sPending };
    }

    // 6. Compare
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
        ...(differences.length > 0 && { differences }),
    };
}
