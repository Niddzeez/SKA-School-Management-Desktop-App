import { getPool } from "../../config/postgres";
import type { AcademicSessionRow } from "../types";

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
async function getSessionDates(year: string): Promise<{ start_date: Date; end_date: Date } | null> {
    const { rows } = await getPool().query<AcademicSessionRow>(
        `SELECT start_date, end_date FROM academic_sessions WHERE name = $1`,
        [year]
    );
    return rows[0] ?? null;
}

/**
 * Returns dashboard overview showing high-level financial totals.
 */
export async function getDashboardOverview(year: string): Promise<DashboardOverviewRow | null> {
    const dates = await getSessionDates(year);
    if (!dates) return null;

    const overviewQuery = `
        SELECT
            COUNT(DISTINCT student_id) AS total_students,
            COALESCE(SUM(paid_total), 0) AS total_collected,
            COALESCE(SUM(base_total + adjustments_total - paid_total), 0) AS total_pending,
            COALESCE(SUM(adjustments_total), 0) AS total_adjustments
        FROM ledger_summary
        WHERE academic_year = $1
    `;

    const expenseQuery = `
        SELECT COALESCE(SUM(amount), 0) AS total_expenses
        FROM expenses
        WHERE expense_date >= $1 AND expense_date <= $2
    `;

    const [overviewRes, expenseRes] = await Promise.all([
        getPool().query(overviewQuery, [year]),
        getPool().query(expenseQuery, [dates.start_date, dates.end_date])
    ]);

    const overview = overviewRes.rows[0];
    const expense = expenseRes.rows[0];

    const totalCollected = overview.total_collected || '0';
    const totalExpenses = expense.total_expenses || '0';

    return {
        total_students: overview.total_students || '0',
        total_collected: totalCollected,
        total_pending: overview.total_pending || '0',
        total_adjustments: overview.total_adjustments || '0',
        total_expenses: totalExpenses,
        net_balance: (parseFloat(totalCollected) - parseFloat(totalExpenses)).toString()
    };
}

/**
 * Returns monthly collections.
 */
export async function getMonthlyCollections(year: string): Promise<MonthlyCollectionRow[]> {
    const { rows } = await getPool().query(
        `SELECT 
            TO_CHAR(p.created_at, 'Mon') as month,
            COALESCE(SUM(p.amount), 0) as amount
         FROM payments p
         JOIN ledger_summary ls ON ls.ledger_id = p.ledger_id
         WHERE ls.academic_year = $1
         GROUP BY TO_CHAR(p.created_at, 'Mon'), TO_CHAR(p.created_at, 'MM')
         ORDER BY TO_CHAR(p.created_at, 'MM') ASC`,
        [year]
    );
    return rows;
}

/**
 * Returns class-wise collections.
 */
export async function getClassWiseCollections(year: string): Promise<ClassCollectionRow[]> {
    const { rows } = await getPool().query(
        `SELECT 
            class_id,
            COALESCE(SUM(paid_total), 0) as collected
         FROM ledger_summary
         WHERE academic_year = $1
         GROUP BY class_id
         ORDER BY collected DESC`,
        [year]
    );
    return rows;
}

/**
 * Returns high level finance summary comparing total income vs total expenses.
 */
export async function getFinanceSummary(year: string): Promise<FinanceSummaryRow | null> {
    const dates = await getSessionDates(year);
    if (!dates) return null;

    const incomeQuery = `
        SELECT COALESCE(SUM(paid_total), 0) as income
        FROM ledger_summary
        WHERE academic_year = $1
    `;

    const expenseQuery = `
        SELECT COALESCE(SUM(amount), 0) as expenses
        FROM expenses
        WHERE expense_date >= $1 AND expense_date <= $2
    `;

    const [incomeRes, expenseRes] = await Promise.all([
        getPool().query(incomeQuery, [year]),
        getPool().query(expenseQuery, [dates.start_date, dates.end_date])
    ]);

    const income = incomeRes.rows[0]?.income || '0';
    const expenses = expenseRes.rows[0]?.expenses || '0';
    const balance = (parseFloat(income) - parseFloat(expenses)).toString();

    return {
        income,
        expenses,
        balance
    };
}

/**
 * Returns the name of the most recent active academic session.
 */
export async function getActiveSessionName(): Promise<string | null> {
    const { rows } = await getPool().query<AcademicSessionRow>(
        `SELECT name FROM academic_sessions WHERE is_closed = false ORDER BY start_date DESC LIMIT 1`
    );
    return rows[0]?.name ?? null;
}

/**
 * Returns recent payments for a given academic year.
 */
export async function getRecentPayments(year: string, limit: number = 10): Promise<RecentPaymentRow[]> {
    const { rows } = await getPool().query<RecentPaymentRow>(
        `SELECT p.id, p.student_id, p.amount, p.mode, p.created_at
         FROM payments p
         JOIN ledger_summary ls ON ls.ledger_id = p.ledger_id
         WHERE ls.academic_year = $1
         ORDER BY p.created_at DESC
         LIMIT $2`,
        [year, limit]
    );
    return rows;
}

