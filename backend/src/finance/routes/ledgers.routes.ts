import { Router, Request, Response } from "express";
import {
    getLedgerSummaryByStudentAndYear,
    getLedgerSummaryById,
    getFullLedgerById,
    createLedger,
    addPayment,
    addAdjustment,
} from "../services/ledger.service";
import {
    mapLedgerSummary,
    mapLedger,
    mapAdjustment,
    mapPayment,
} from "../mappers/ledger.mapper";
import { toErrorResponse, NotFoundError, ValidationError } from "../../shared/error";
import {
    isMongoId,
    isUUID,
    validateAdjustmentType,
    validatePaymentMode,
} from "../../shared/validators";
import { requireRole } from "../../auth/middleware/requireRole";

const router = Router();

// ===========================================================================
// READ ENDPOINTS (Phase 4)
// ===========================================================================

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

        const fullLedger = await getFullLedgerById(ledgerId);

        if (!fullLedger) {
            throw new NotFoundError("Ledger", ledgerId);
        }

        res.json({
            ...mapLedgerSummary(fullLedger),
            baseComponents: fullLedger.base_components,
            createdAt: fullLedger.created_at instanceof Date
                ? fullLedger.created_at.toISOString()
                : String(fullLedger.created_at),
            adjustments: fullLedger.adjustments.map(mapAdjustment),
            payments: fullLedger.payments.map(mapPayment),
        });
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// ===========================================================================
// WRITE ENDPOINTS (Phase 5)
// ===========================================================================

// ---------------------------------------------------------------------------
// POST /api/ledgers
// Creates a new student fee ledger.
//
// Body:
//   { studentId, classId, academicSessionId, baseComponents }
//
// baseComponents: [{ name: string, amount: number }, ...]
// ---------------------------------------------------------------------------
router.post("/", requireRole("ADMIN") as any, async (req: Request, res: Response) => {
    try {
        const { studentId, classId, academicSessionId, baseComponents } = req.body;

        // --- Validate studentId ---
        if (!studentId || typeof studentId !== "string" || !isMongoId(studentId)) {
            throw new ValidationError("'studentId' must be a valid MongoDB ObjectId");
        }

        // --- Validate classId ---
        if (!classId || typeof classId !== "string" || !isMongoId(classId)) {
            throw new ValidationError("'classId' must be a valid MongoDB ObjectId");
        }

        // --- Validate academicSessionId ---
        if (!academicSessionId || typeof academicSessionId !== "string" || !isUUID(academicSessionId)) {
            throw new ValidationError("'academicSessionId' must be a valid UUID");
        }

        // --- Validate baseComponents ---
        if (!Array.isArray(baseComponents) || baseComponents.length === 0) {
            throw new ValidationError("'baseComponents' must be a non-empty array");
        }
        for (let i = 0; i < baseComponents.length; i++) {
            const comp = baseComponents[i];
            if (!comp || typeof comp.name !== "string" || !comp.name.trim()) {
                throw new ValidationError(`baseComponents[${i}].name must be a non-empty string`);
            }
            if (typeof comp.amount !== "number" || comp.amount <= 0) {
                throw new ValidationError(`baseComponents[${i}].amount must be a positive number`);
            }
        }

        const sanitised = baseComponents.map((c: { name: string; amount: number }) => ({
            name: c.name.trim(),
            amount: c.amount,
        }));

        const row = await createLedger(studentId, classId, academicSessionId, sanitised);
        res.status(201).json(mapLedger(row));
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// ---------------------------------------------------------------------------
// POST /api/ledgers/:ledgerId/payments
// Records a payment against a ledger.
//
// Body:
//   { amount, mode, collectedBy, reference? }
// ---------------------------------------------------------------------------
router.post("/:ledgerId/payments", requireRole("ADMIN") as any, async (req: Request, res: Response) => {
    try {
        const ledgerId = String(req.params.ledgerId);

        if (!isUUID(ledgerId)) {
            throw new ValidationError("'ledgerId' must be a valid UUID");
        }

        const { amount, mode, collectedBy, reference } = req.body;

        // --- Validate amount ---
        if (typeof amount !== "number" || amount <= 0) {
            throw new ValidationError("'amount' must be a positive number");
        }

        // --- Validate mode ---
        const validatedMode = validatePaymentMode(mode);

        // --- Validate collectedBy ---
        if (!collectedBy || typeof collectedBy !== "string" || !collectedBy.trim()) {
            throw new ValidationError("'collectedBy' is required");
        }

        // --- Validate reference (optional) ---
        const ref = typeof reference === "string" && reference.trim()
            ? reference.trim()
            : undefined;

        const row = await addPayment(ledgerId, amount, validatedMode, collectedBy.trim(), ref);
        res.status(201).json(mapPayment(row));
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// ---------------------------------------------------------------------------
// POST /api/ledgers/:ledgerId/adjustments
// Adds a fee adjustment to a ledger.
//
// Body:
//   { type, amount, reason, approvedBy }
//
// Amount sign convention:
//   DISCOUNT, CONCESSION, WAIVER → negative
//   EXTRA, LATE_FEE             → positive
// ---------------------------------------------------------------------------
router.post("/:ledgerId/adjustments", requireRole("ADMIN") as any, async (req: Request, res: Response) => {
    try {
        const ledgerId = String(req.params.ledgerId);

        if (!isUUID(ledgerId)) {
            throw new ValidationError("'ledgerId' must be a valid UUID");
        }

        const { type, amount, reason, approvedBy } = req.body;

        // --- Validate type ---
        const validatedType = validateAdjustmentType(type);

        // --- Validate amount ---
        if (typeof amount !== "number" || amount === 0) {
            throw new ValidationError("'amount' must be a non-zero number");
        }

        // Validate sign matches type before hitting DB constraint
        const negativeTy = ["DISCOUNT", "CONCESSION", "WAIVER"];
        if (negativeTy.includes(validatedType) && amount > 0) {
            throw new ValidationError(
                `'${validatedType}' adjustments must have a negative amount`
            );
        }
        if (!negativeTy.includes(validatedType) && amount < 0) {
            throw new ValidationError(
                `'${validatedType}' adjustments must have a positive amount`
            );
        }

        // --- Validate reason ---
        if (!reason || typeof reason !== "string" || !reason.trim()) {
            throw new ValidationError("'reason' is required");
        }

        // --- Validate approvedBy ---
        if (!approvedBy || typeof approvedBy !== "string" || !approvedBy.trim()) {
            throw new ValidationError("'approvedBy' is required");
        }

        const row = await addAdjustment(
            ledgerId, validatedType, amount, reason.trim(), approvedBy.trim()
        );
        res.status(201).json(mapAdjustment(row));
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

export default router;
