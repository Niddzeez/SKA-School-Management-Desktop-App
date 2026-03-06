import { Router, Request, Response } from "express";
import { getExpenses, createExpense } from "../services/expense.service";
import { mapExpense } from "../mappers/expense.mapper";
import { toErrorResponse, ValidationError } from "../../shared/error";
import {
    validateExpenseCategory,
    validateExpenseMode,
} from "../../shared/validators";
import { requireRole } from "../../auth/middleware/requireRole";

const router = Router();

// ===========================================================================
// READ ENDPOINTS (Phase 4)
// ===========================================================================

// ---------------------------------------------------------------------------
// GET /api/expenses
// Returns school expenses, optionally filtered by category and/or date range.
//
// Query parameters (all optional):
//   ?category=SALARY|UTILITY|MAINTENANCE|PURCHASE|OTHER
//   ?from=YYYY-MM-DD
//   ?to=YYYY-MM-DD
//   ?limit=10
//   ?offset=20
//
// Example:
//   GET /api/expenses?category=SALARY&from=2025-04-01&to=2026-03-31&limit=50
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

        const limit = typeof req.query.limit === "string"
            ? parseInt(req.query.limit, 10)
            : undefined;

        const offset = typeof req.query.offset === "string"
            ? parseInt(req.query.offset, 10)
            : undefined;

        const rows = await getExpenses({ category, from, to, limit, offset });
        res.json(rows.map(mapExpense));
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// ===========================================================================
// WRITE ENDPOINTS (Phase 5)
// ===========================================================================

// ---------------------------------------------------------------------------
// POST /api/expenses
// Records a new school expense.
//
// Body:
//   { category, description, amount, expenseDate, paidTo,
//     mode, recordedBy, reference? }
// ---------------------------------------------------------------------------
router.post("/", requireRole("ADMIN") as any, async (req: Request, res: Response) => {
    try {
        const {
            category, description, amount, expenseDate,
            paidTo, mode, recordedBy, reference,
        } = req.body;

        // --- Validate category ---
        const validatedCategory = validateExpenseCategory(category);

        // --- Validate description ---
        if (!description || typeof description !== "string" || !description.trim()) {
            throw new ValidationError("'description' is required");
        }

        // --- Validate amount ---
        if (typeof amount !== "number" || amount <= 0) {
            throw new ValidationError("'amount' must be a positive number");
        }

        // --- Validate expenseDate ---
        if (!expenseDate || typeof expenseDate !== "string") {
            throw new ValidationError("'expenseDate' is required");
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(expenseDate)) {
            throw new ValidationError("'expenseDate' must be in YYYY-MM-DD format");
        }

        // --- Validate paidTo ---
        if (!paidTo || typeof paidTo !== "string" || !paidTo.trim()) {
            throw new ValidationError("'paidTo' is required");
        }

        // --- Validate mode ---
        const validatedMode = validateExpenseMode(mode);

        // --- Validate recordedBy ---
        if (!recordedBy || typeof recordedBy !== "string" || !recordedBy.trim()) {
            throw new ValidationError("'recordedBy' is required");
        }

        // --- Validate reference (optional) ---
        const ref = typeof reference === "string" && reference.trim()
            ? reference.trim()
            : undefined;

        const row = await createExpense({
            category: validatedCategory,
            description: description.trim(),
            amount,
            expenseDate,
            paidTo: paidTo.trim(),
            mode: validatedMode,
            recordedBy: recordedBy.trim(),
            reference: ref,
        }, (req as any).user?.userId || "UNKNOWN_USER");

        res.status(201).json(mapExpense(row));
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

export default router;
