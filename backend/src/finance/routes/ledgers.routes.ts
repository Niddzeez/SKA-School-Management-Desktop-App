import { Router, Request, Response } from "express";
import {
    getLedgerSummaryByStudentAndYear,
    getLedgerById,
    getLedgerSummaryById,
    getAdjustmentsByLedger,
    getPaymentsByLedger,
} from "../services/ledger.service";
import {
    mapLedgerSummary,
    mapAdjustment,
    mapPayment,
} from "../mappers/ledger.mapper";
import { toErrorResponse, NotFoundError, ValidationError } from "../../shared/error";
import { isMongoId } from "../../shared/validators";

const router = Router();

// ---------------------------------------------------------------------------
// UUID format guard (basic)
// ---------------------------------------------------------------------------
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isUUID = (v: string) => UUID_RE.test(v);

// ---------------------------------------------------------------------------
// GET /api/ledgers?studentId=<mongoId>&year=<2025-26>
// Returns ledger summary (derived totals) for a student in a given year.
// ---------------------------------------------------------------------------
router.get("/", async (req: Request, res: Response) => {
    try {
        const { studentId, year } = req.query;

        if (!studentId || typeof studentId !== "string" || !isMongoId(studentId)) {
            throw new ValidationError("Query parameter 'studentId' must be a valid MongoDB ObjectId");
        }
        if (!year || typeof year !== "string") {
            throw new ValidationError("Query parameter 'year' is required (e.g. '2025-26')");
        }
        if (!/^\d{4}-\d{2}$/.test(year)) {
            throw new ValidationError("'year' must match the format YYYY-YY (e.g. '2025-26')");
        }

        const summary = await getLedgerSummaryByStudentAndYear(studentId, year);
        if (!summary) {
            throw new NotFoundError(
                "Ledger",
                `student '${studentId}' for year '${year}'`
            );
        }

        res.json(mapLedgerSummary(summary));
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// ---------------------------------------------------------------------------
// GET /api/ledgers/:ledgerId/summary
// Returns only the computed financial summary from the ledger_summary view.
// IMPORTANT: must be registered BEFORE /:ledgerId to prevent Express from
// treating the literal "summary" segment as a ledgerId parameter.
// ---------------------------------------------------------------------------
router.get("/:ledgerId/summary", async (req: Request, res: Response) => {
    try {
        const ledgerId = String(req.params.ledgerId);

        if (!isUUID(ledgerId)) {
            throw new ValidationError("'ledgerId' must be a valid UUID");
        }

        const summary = await getLedgerSummaryById(ledgerId);
        if (!summary) {
            throw new NotFoundError("Ledger", ledgerId);
        }

        res.json(mapLedgerSummary(summary));
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// ---------------------------------------------------------------------------
// GET /api/ledgers/:ledgerId
// Returns full ledger detail: base_components + adjustments + payments.
// ---------------------------------------------------------------------------
router.get("/:ledgerId", async (req: Request, res: Response) => {
    try {
        const ledgerId = String(req.params.ledgerId);

        if (!isUUID(ledgerId)) {
            throw new ValidationError("'ledgerId' must be a valid UUID");
        }

        const [ledgerRow, summaryRow, adjustmentRows, paymentRows] =
            await Promise.all([
                getLedgerById(ledgerId),
                getLedgerSummaryById(ledgerId),
                getAdjustmentsByLedger(ledgerId),
                getPaymentsByLedger(ledgerId),
            ]);

        if (!ledgerRow || !summaryRow) {
            throw new NotFoundError("Ledger", ledgerId);
        }

        res.json({
            ...mapLedgerSummary(summaryRow),
            baseComponents: ledgerRow.base_components,
            createdAt: ledgerRow.created_at instanceof Date
                ? ledgerRow.created_at.toISOString()
                : String(ledgerRow.created_at),
            adjustments: adjustmentRows.map(mapAdjustment),
            payments: paymentRows.map(mapPayment),
        });
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

export default router;
