import { Router, Request, Response } from "express";
import { getExpenses } from "../services/expense.service";
import { mapExpense } from "../mappers/expense.mapper";
import { toErrorResponse } from "../../shared/error";

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/expenses
// Returns school expenses, optionally filtered by category and/or date range.
//
// Query parameters (all optional):
//   ?category=SALARY|UTILITY|MAINTENANCE|PURCHASE|OTHER
//   ?from=YYYY-MM-DD
//   ?to=YYYY-MM-DD
//
// Example:
//   GET /api/expenses?category=SALARY&from=2025-04-01&to=2026-03-31
// ---------------------------------------------------------------------------
router.get("/", async (req: Request, res: Response) => {
    try {
        const category = typeof req.query.category === "string"
            ? req.query.category
            : undefined;

        const from = typeof req.query.from === "string"
            ? req.query.from
            : undefined;

        const to = typeof req.query.to === "string"
            ? req.query.to
            : undefined;

        const rows = await getExpenses({ category, from, to });
        res.json(rows.map(mapExpense));
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

export default router;
