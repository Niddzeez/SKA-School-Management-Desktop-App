import { getDashboardOverview } from "./dashboard.service";
import { getLedgersByYear } from "../../finance/services/ledger.service";
import { getPool } from "../../config/postgres";

export async function getDashboardBootstrap(sessionId: string) {

    const pool = getPool();

    const [
        overview,
        ledgers,
        feeStructures,
        expenses
    ] = await Promise.all([

        getDashboardOverview(sessionId),

        getLedgersByYear(sessionId),

        pool.query(
            `SELECT *
             FROM fee_structures
             WHERE academic_session_id = $1`,
            [sessionId]
        ),

        pool.query(
            `SELECT *
             FROM expenses
             WHERE academic_session_id = $1`,
            [sessionId]
        )

    ]);

    return {
        overview,
        ledgers,
        feeStructures: feeStructures.rows,
        expenses: expenses.rows
    };
}