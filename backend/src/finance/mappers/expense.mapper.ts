import type { ExpenseRow } from "../types";

/**
 * Maps an expenses Postgres row to the frontend Expense shape.
 *
 * Frontend Expense type:
 *   { id, category, description, amount, expenseDate, paidTo,
 *     mode, recordedBy, reference?, recordedAt }
 */
export const mapExpense = (row: ExpenseRow) => ({
    id: row.id,
    category: row.category,
    description: row.description,
    amount: Number(row.amount),
    expenseDate: row.expense_date instanceof Date
        ? row.expense_date.toISOString().split("T")[0]   // YYYY-MM-DD
        : String(row.expense_date),
    paidTo: row.paid_to,
    mode: row.mode,
    recordedBy: row.recorded_by,
    reference: row.reference ?? undefined,
    recordedAt: row.recorded_at instanceof Date
        ? row.recorded_at.toISOString()
        : String(row.recorded_at),
});
