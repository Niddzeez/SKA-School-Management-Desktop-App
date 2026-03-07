import { getPool } from "../../config/postgres";

export interface TimelineEvent {
    timestamp: string;
    type: string;
    description: string;
    amount: number;
}

export interface LedgerTimelineReport {
    ledgerId: string;
    timeline: TimelineEvent[];
}

export async function buildLedgerTimeline(ledgerId: string): Promise<LedgerTimelineReport> {
    const pool = getPool();
    const timeline: TimelineEvent[] = [];

    // 1. Fetch Ledger Creation details
    const ledgerRes = await pool.query<{ created_at: Date; base_components: any }>(
        `SELECT created_at, base_components FROM student_fee_ledgers WHERE id = $1`,
        [ledgerId]
    );

    if (ledgerRes.rows.length === 0) {
        throw new Error(`Ledger ${ledgerId} not found`);
    }

    const ledgerRow = ledgerRes.rows[0];
    const baseComponents: { name: string; amount: string | number }[] = ledgerRow.base_components;
    const baseTotal = baseComponents.reduce((sum, comp) => sum + Number(comp.amount), 0);

    timeline.push({
        timestamp: ledgerRow.created_at.toISOString(),
        type: "LEDGER_CREATED",
        description: "Ledger initialized with base fee components",
        amount: baseTotal,
    });

    // 2. Fetch Payments
    const payRes = await pool.query<{ created_at: Date; amount: string; mode: string; collected_by: string }>(
        `SELECT created_at, amount, mode, collected_by FROM payments WHERE ledger_id = $1`,
        [ledgerId]
    );

    for (const p of payRes.rows) {
        timeline.push({
            timestamp: p.created_at.toISOString(),
            type: "PAYMENT",
            description: `Payment received (${p.mode}) by ${p.collected_by}`,
            amount: Number(p.amount),
        });
    }

    // 3. Fetch Adjustments
    const adjRes = await pool.query<{ created_at: Date; amount: string; type: string; reason: string }>(
        `SELECT created_at, amount, type, reason FROM ledger_adjustments WHERE ledger_id = $1`,
        [ledgerId]
    );

    for (const a of adjRes.rows) {
        timeline.push({
            timestamp: a.created_at.toISOString(),
            type: "ADJUSTMENT",
            description: `[${a.type}] ${a.reason}`,
            amount: Number(a.amount),
        });
    }

    // 4. Sort chronologically
    timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return {
        ledgerId,
        timeline,
    };
}
