
import { getPool } from "../../config/postgres";
import type { AcademicSessionRow } from "../../finance/types";

export interface DashboardOverviewRow {
    total_students: string;
    total_collected: string;
    total_pending: string;
    total_adjustments: string;
    total_expenses: string;
    net_balance: string;
}

export interface RecentPaymentRow {
    id: string;
    student_id: string;
    amount: string;
    mode: string;
    created_at: Date;
}

export interface MonthlyCollectionRow {
    month: string;
    amount: string;
}

export interface ClassCollectionRow {
    class_id: string;
    collected: string;
}

export interface FinanceSummaryRow {
    income: string;
    expenses: string;
    balance: string;
}

/**
 * Helper to fetch session dates
 */
async function getSessionInfo(sessionId: string) {
    const { rows } = await getPool().query(
        `SELECT name, start_date, end_date
         FROM academic_sessions
         WHERE id = $1`,
        [sessionId]
    );

    return rows[0] ?? null;
}

/**
 * Dashboard Overview
 */
export async function getDashboardOverview(sessionId: string): Promise<DashboardOverviewRow | null> {

    const session = await getSessionInfo(sessionId);
    if (!session) return null;

    const year = session.name;

    const ledgerQuery = `
    SELECT
      COUNT(DISTINCT student_id) AS total_students,
      COALESCE(SUM(base_total + adjustments_total - paid_total),0) AS total_pending,
      COALESCE(SUM(adjustments_total),0) AS total_adjustments
    FROM ledger_summary
    WHERE academic_year = $1
  `;

    const financeQuery = `
    SELECT
      COALESCE(SUM(income_total),0) AS total_collected,
      COALESCE(SUM(expense_total),0) AS total_expenses
    FROM finance_monthly_summary
    WHERE academic_year = $1
  `;

    const [ledgerRes, financeRes] = await Promise.all([
        getPool().query(ledgerQuery, [year]),
        getPool().query(financeQuery, [year])
    ]);

    const ledger = ledgerRes.rows[0];
    const finance = financeRes.rows[0];

    const income = Number(finance.total_collected || 0);
    const expenses = Number(finance.total_expenses || 0);

    return {
        total_students: ledger.total_students || "0",
        total_collected: income.toString(),
        total_pending: ledger.total_pending || "0",
        total_adjustments: ledger.total_adjustments || "0",
        total_expenses: expenses.toString(),
        net_balance: (income - expenses).toString()
    };
}

/**
 * Monthly Collections (uses summary table)
 */
export async function getMonthlyCollections(year: string): Promise<MonthlyCollectionRow[]> {

    const { rows } = await getPool().query(
        `
        SELECT
            TO_CHAR(month, 'Mon') AS month,
            income_total AS amount
        FROM finance_monthly_summary
        WHERE academic_year = $1
        ORDER BY month
        `,
        [year]
    );

    return rows;
}

/**
 * Class-wise collections
 */
export async function getClassWiseCollections(year: string): Promise<ClassCollectionRow[]> {

    const { rows } = await getPool().query(
        `
        SELECT
            class_id,
            COALESCE(SUM(paid_total),0) AS collected
        FROM ledger_summary
        WHERE academic_year = $1
        GROUP BY class_id
        ORDER BY collected DESC
        `,
        [year]
    );

    return rows;
}

/**
 * Finance Summary (income vs expenses)
 */
export async function getFinanceSummary(year: string): Promise<FinanceSummaryRow | null> {

    const { rows } = await getPool().query(
        `
        SELECT
            COALESCE(SUM(income_total),0) AS income,
            COALESCE(SUM(expense_total),0) AS expenses,
            COALESCE(SUM(net_total),0) AS balance
        FROM finance_monthly_summary
        WHERE academic_year = $1
        `,
        [year]
    );

    return rows[0] ?? null;
}

/**
 * Active academic session
 */
export async function getActiveSessionName(): Promise<string | null> {

    const { rows } = await getPool().query<AcademicSessionRow>(
        `
        SELECT name
        FROM academic_sessions
        WHERE is_closed = false
        ORDER BY start_date DESC
        LIMIT 1
        `
    );

    return rows[0]?.name ?? null;
}

/**
 * Recent Payments
 */
export async function getRecentPayments(year: string, limit: number = 10): Promise<RecentPaymentRow[]> {

    const { rows } = await getPool().query<RecentPaymentRow>(
        `
        SELECT p.id, p.student_id, p.amount, p.mode, p.created_at
        FROM payments p
        JOIN ledger_summary ls ON ls.ledger_id = p.ledger_id
        WHERE ls.academic_year = $1
        ORDER BY p.created_at DESC
        LIMIT $2
        `,
        [year, limit]
    );

    return rows;
}
