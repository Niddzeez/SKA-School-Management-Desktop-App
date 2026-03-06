import { getPool, withTransaction } from "../../config/postgres";
import type { ExpenseRow } from "../types";
import { ValidationError } from "../../shared/error";
import type { ExpenseCategory, ExpenseMode } from "../../shared/validators";
import { logFinancialEvent } from "../audit/audit.service";

const VALID_CATEGORIES = [
    "SALARY", "UTILITY", "MAINTENANCE", "PURCHASE", "OTHER",
] as const;

type ExpenseCategoryLocal = typeof VALID_CATEGORIES[number];

export interface ExpenseFilters {
    category?: string;
    from?: string;    // YYYY-MM-DD
    to?: string;      // YYYY-MM-DD
    limit?: number;
    offset?: number;
}

/**
 * Returns expenses with optional filters for date range, category, and pagination.
 * All parameters are passed as SQL bind values — no string interpolation.
 */
export async function getExpenses(
    filters: ExpenseFilters = {}
): Promise<ExpenseRow[]> {
    const { category, from, to } = filters;

    // Validate category if supplied
    if (category && !VALID_CATEGORIES.includes(category as ExpenseCategoryLocal)) {
        throw new ValidationError(
            `Invalid category '${category}'. Must be one of: ${VALID_CATEGORIES.join(", ")}`
        );
    }

    // Validate date formats
    const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
    if (from && !ISO_DATE.test(from)) {
        throw new ValidationError("'from' must be a date in YYYY-MM-DD format");
    }
    if (to && !ISO_DATE.test(to)) {
        throw new ValidationError("'to' must be a date in YYYY-MM-DD format");
    }

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (category) {
        params.push(category);
        conditions.push(`category = $${params.length}`);
    }
    if (from) {
        params.push(from);
        conditions.push(`expense_date >= $${params.length}`);
    }
    if (to) {
        params.push(to);
        conditions.push(`expense_date <= $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // Pagination
    const limit = filters.limit ? Math.min(Math.max(1, filters.limit), 100) : 50;
    const offset = filters.offset ? Math.max(0, filters.offset) : 0;

    params.push(limit);
    const limitIdx = params.length;
    params.push(offset);
    const offsetIdx = params.length;

    const { rows } = await getPool().query<ExpenseRow>(
        `SELECT id, category, description, amount, expense_date,
            paid_to, mode, recorded_by, reference, recorded_at
     FROM   expenses
     ${where}
     ORDER  BY expense_date DESC, recorded_at DESC
     LIMIT  $${limitIdx}
     OFFSET $${offsetIdx}`,
        params
    );
    return rows;
}

// ===========================================================================
// WRITE OPERATIONS (Phase 5)
// ===========================================================================

export interface CreateExpenseData {
    category: ExpenseCategory;
    description: string;
    amount: number;
    expenseDate: string;   // YYYY-MM-DD
    paidTo: string;
    mode: ExpenseMode;
    recordedBy: string;
    reference?: string;
}

/**
 * Creates a new expense record.
 * All validation is expected to be done before calling this function.
 */
export async function createExpense(data: CreateExpenseData, performedBy: string): Promise<ExpenseRow> {
    const result = await withTransaction(async (client) => {
        const { rows } = await client.query<ExpenseRow>(
            `INSERT INTO expenses
                 (category, description, amount, expense_date,
                  paid_to, mode, recorded_by, reference)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, category, description, amount, expense_date,
                       paid_to, mode, recorded_by, reference, recorded_at`,
            [
                data.category,
                data.description,
                data.amount,
                data.expenseDate,
                data.paidTo,
                data.mode,
                data.recordedBy,
                data.reference ?? null,
            ]
        );
        return rows[0];
    });

    await logFinancialEvent(
        "EXPENSE_CREATED",
        "EXPENSE",
        result.id,
        performedBy,
        {
            category: data.category,
            amount: data.amount,
            expenseDate: data.expenseDate,
            mode: data.mode
        }
    );

    return result;
}
