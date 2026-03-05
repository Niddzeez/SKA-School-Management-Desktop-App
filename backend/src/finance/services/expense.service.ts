import { getPool } from "../../config/postgres";
import type { ExpenseRow } from "../types";
import { ValidationError } from "../../shared/error";

const VALID_CATEGORIES = [
    "SALARY", "UTILITY", "MAINTENANCE", "PURCHASE", "OTHER",
] as const;

type ExpenseCategory = typeof VALID_CATEGORIES[number];

export interface ExpenseFilters {
    category?: string;
    from?: string;    // YYYY-MM-DD
    to?: string;      // YYYY-MM-DD
}

/**
 * Returns expenses with optional filters for date range and category.
 * All parameters are passed as SQL bind values — no string interpolation.
 */
export async function getExpenses(
    filters: ExpenseFilters = {}
): Promise<ExpenseRow[]> {
    const { category, from, to } = filters;

    // Validate category if supplied
    if (category && !VALID_CATEGORIES.includes(category as ExpenseCategory)) {
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

    const { rows } = await getPool().query<ExpenseRow>(
        `SELECT id, category, description, amount, expense_date,
            paid_to, mode, recorded_by, reference, recorded_at
     FROM   expenses
     ${where}
     ORDER  BY expense_date DESC, recorded_at DESC`,
        params
    );
    return rows;
}
