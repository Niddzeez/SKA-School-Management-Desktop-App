import { Router, Request, Response } from "express";
import {
    getCollectionSummary,
    getClassWiseDues,
    getPaymentHistory,
    getIncomeReport,
    getExpenseReport,
    getCombinedReport
} from "../services/report.service";
import { toErrorResponse, ValidationError } from "../../shared/error";
import { getClassNameMap, getStudentBasicInfoMap } from "../../shared/identity-lookup";

const router = Router();

// ---------------------------------------------------------------------------
// Year format guard (reused across reporting endpoints)
// ---------------------------------------------------------------------------
const YEAR_RE = /^\d{4}-\d{2}$/;

// ---------------------------------------------------------------------------
// GET /api/reports/collection-summary?year=2025-26
// Returns aggregate financial totals for an academic year.
// ---------------------------------------------------------------------------
router.get("/collection-summary", async (req: Request, res: Response) => {
    try {
        const { year } = req.query;

        if (!year || typeof year !== "string" || !YEAR_RE.test(year)) {
            throw new ValidationError("Query parameter 'year' is required and must match YYYY-YY (e.g. '2025-26')");
        }

        const summary = await getCollectionSummary(year);

        res.json({
            year,
            totalFees: Number(summary?.total_fees ?? 0),
            totalCollected: Number(summary?.total_collected ?? 0),
            totalPending: Number(summary?.total_pending ?? 0),
            totalAdjustments: Number(summary?.total_adjustments ?? 0),
            ledgerCount: Number(summary?.ledger_count ?? 0),
        });
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// ---------------------------------------------------------------------------
// GET /api/reports/class-wise-dues?year=2025-26
// Returns pending dues grouped by class for an academic year.
// Class names are resolved from MongoDB via identity-lookup.
// ---------------------------------------------------------------------------
router.get("/class-wise-dues", async (req: Request, res: Response) => {
    try {
        const { year } = req.query;

        if (!year || typeof year !== "string" || !YEAR_RE.test(year)) {
            throw new ValidationError("Query parameter 'year' is required and must match YYYY-YY (e.g. '2025-26')");
        }

        const rows = await getClassWiseDues(year);

        // Resolve class names from identity subsystem
        const classIds = rows.map((r) => r.class_id);
        const classNames = await getClassNameMap(classIds);

        res.json(
            rows.map((row) => ({
                classId: row.class_id,
                className: classNames.get(row.class_id) ?? "Unknown",
                studentCount: Number(row.student_count),
                totalPending: Number(row.total_pending),
            }))
        );
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// ---------------------------------------------------------------------------
// GET /api/reports/payment-history?year=2025-26&fromDate=&toDate=&limit=&offset=
// Returns paginated payment history for an academic year.
// ---------------------------------------------------------------------------
router.get("/payment-history", async (req: Request, res: Response) => {
    try {
        const { year, fromDate, toDate } = req.query;

        if (!year || typeof year !== "string" || !YEAR_RE.test(year)) {
            throw new ValidationError("Query parameter 'year' is required and must match YYYY-YY (e.g. '2025-26')");
        }

        const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
        const from = typeof fromDate === "string" ? fromDate : undefined;
        const to = typeof toDate === "string" ? toDate : undefined;

        if (from && !ISO_DATE.test(from)) {
            throw new ValidationError("'fromDate' must be in YYYY-MM-DD format");
        }
        if (to && !ISO_DATE.test(to)) {
            throw new ValidationError("'toDate' must be in YYYY-MM-DD format");
        }

        const limit = typeof req.query.limit === "string"
            ? parseInt(req.query.limit, 10)
            : undefined;

        const offset = typeof req.query.offset === "string"
            ? parseInt(req.query.offset, 10)
            : undefined;

        const rows = await getPaymentHistory({
            year,
            fromDate: from,
            toDate: to,
            limit,
            offset,
        });

        res.json(
            rows.map((row) => ({
                paymentId: row.id,
                ledgerId: row.ledger_id,
                studentId: row.student_id,
                amount: Number(row.amount),
                mode: row.mode,
                collectedBy: row.collected_by,
                reference: row.reference ?? undefined,
                createdAt: row.created_at instanceof Date
                    ? row.created_at.toISOString()
                    : String(row.created_at),
            }))
        );
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// ---------------------------------------------------------------------------
// GET /api/reports/income
// ---------------------------------------------------------------------------
router.get("/income", async (req: Request, res: Response) => {
    try {
        const { year, fromDate, toDate } = req.query;
        if (!year || typeof year !== "string" || !YEAR_RE.test(year)) {
            throw new ValidationError("Query parameter 'year' is required and must match YYYY-YY (e.g. '2025-26')");
        }

        const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
        const from = typeof fromDate === "string" ? fromDate : undefined;
        const to = typeof toDate === "string" ? toDate : undefined;

        if (from && !ISO_DATE.test(from)) throw new ValidationError("'fromDate' must be in YYYY-MM-DD format");
        if (to && !ISO_DATE.test(to)) throw new ValidationError("'toDate' must be in YYYY-MM-DD format");

        const report = await getIncomeReport(year, from, to);

        // Resolve student names for the nested payments payload if possible
        if (report.payments.length > 0) {
            const studentIds = report.payments.map(p => p.student_id);
            const studentMap = await getStudentBasicInfoMap(studentIds);

            report.payments = report.payments.map((p: any) => ({
                ...p,
                studentName: studentMap.has(p.student_id)
                    ? `${studentMap.get(p.student_id)!.firstName} ${studentMap.get(p.student_id)!.lastName}`
                    : "Unknown"
            })) as any;
        }

        res.json(report);
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// ---------------------------------------------------------------------------
// GET /api/reports/expenses
// ---------------------------------------------------------------------------
router.get("/expenses", async (req: Request, res: Response) => {
    try {
        const { year, fromDate, toDate } = req.query;
        if (!year || typeof year !== "string" || !YEAR_RE.test(year)) {
            throw new ValidationError("Query parameter 'year' is required and must match YYYY-YY (e.g. '2025-26')");
        }

        const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
        const from = typeof fromDate === "string" ? fromDate : undefined;
        const to = typeof toDate === "string" ? toDate : undefined;

        if (from && !ISO_DATE.test(from)) throw new ValidationError("'fromDate' must be in YYYY-MM-DD format");
        if (to && !ISO_DATE.test(to)) throw new ValidationError("'toDate' must be in YYYY-MM-DD format");

        const report = await getExpenseReport(year, from, to);
        res.json(report);
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// ---------------------------------------------------------------------------
// GET /api/reports/combined
// ---------------------------------------------------------------------------
router.get("/combined", async (req: Request, res: Response) => {
    try {
        const { year, fromDate, toDate } = req.query;
        if (!year || typeof year !== "string" || !YEAR_RE.test(year)) {
            throw new ValidationError("Query parameter 'year' is required and must match YYYY-YY (e.g. '2025-26')");
        }

        const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
        const from = typeof fromDate === "string" ? fromDate : undefined;
        const to = typeof toDate === "string" ? toDate : undefined;

        if (from && !ISO_DATE.test(from)) throw new ValidationError("'fromDate' must be in YYYY-MM-DD format");
        if (to && !ISO_DATE.test(to)) throw new ValidationError("'toDate' must be in YYYY-MM-DD format");

        const report = await getCombinedReport(year, from, to);
        res.json(report);
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

export default router;
