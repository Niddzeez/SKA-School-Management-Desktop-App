import { Router, Request, Response } from "express";
import {
    getCollectionSummary,
    getClassWiseDues,
    getPaymentHistory,
    getIncomeReport,
    getExpenseReport,
    getCombinedReport,
    getYearEndStatementFast
} from "../services/report.service";

import { toErrorResponse } from "../../shared/error";
import { extractReportParams } from "../../shared/report-params";
import { getClassNameMap, getStudentBasicInfoMap } from "../../shared/identity-lookup";
import { yearEndReportHandler } from "../controllers/report.controller";
import { getPendingFees } from "../services/report.service";
import { isUUID } from "../../shared/validators";
import { ValidationError } from "../../shared/error";

const router = Router();

/* ------------------------------------------------ */
router.get("/collection-summary", async (req: Request, res: Response) => {
    try {

        const { year } = extractReportParams(req.query);

        const summary = await getCollectionSummary(year);

        res.json({
            year,
            totalFees: Number(summary?.total_fees ?? 0),
            totalCollected: Number(summary?.total_collected ?? 0),
            totalPending: Number(summary?.total_pending ?? 0),
            totalAdjustments: Number(summary?.total_adjustments ?? 0),
            ledgerCount: Number(summary?.ledger_count ?? 0)
        });

    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

/* ------------------------------------------------ */
router.get("/class-wise-dues", async (req: Request, res: Response) => {
    try {

        const { year } = extractReportParams(req.query);

        const rows = await getClassWiseDues(year);

        const classIds = rows.map(r => r.class_id);
        const classNames = await getClassNameMap(classIds);

        res.json(
            rows.map(r => ({
                classId: r.class_id,
                className: classNames.get(r.class_id) ?? "Unknown",
                studentCount: Number(r.student_count),
                totalPending: Number(r.total_pending)
            }))
        );

    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

/* ------------------------------------------------ */
router.get("/payment-history", async (req: Request, res: Response) => {
    try {

        const { year, fromDate, toDate } = extractReportParams(req.query);

        const rows = await getPaymentHistory({
            year,
            fromDate,
            toDate
        });

        res.json(rows);

    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

/* ------------------------------------------------ */
router.get("/income", async (req: Request, res: Response) => {
    try {

        const { year, fromDate, toDate } = extractReportParams(req.query);

        const report = await getIncomeReport(year, fromDate, toDate);

        if (report.payments.length > 0) {

            const studentIds = report.payments.map(p => p.student_id);
            const studentMap = await getStudentBasicInfoMap(studentIds);

            report.payments = report.payments.map(p => ({
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

/* ------------------------------------------------ */
router.get("/expenses", async (req: Request, res: Response) => {
    try {

        const { year, fromDate, toDate } = extractReportParams(req.query);

        const report = await getExpenseReport(year, fromDate, toDate);

        res.json(report);

    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

/* ------------------------------------------------ */
router.get("/combined", async (req: Request, res: Response) => {
    try {

        const { year, fromDate, toDate } = extractReportParams(req.query);

        const report = await getCombinedReport(year, fromDate, toDate);

        if (report.incomes.length > 0) {
            const studentIds = report.incomes.map(p => p.student_id);
            const studentMap = await getStudentBasicInfoMap(studentIds);

            report.incomes = report.incomes.map(p => ({
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

/* ------------------------------------------------ */
router.get("/year-end", yearEndReportHandler);

router.get("/pending-fees", async (req: Request, res: Response) => {

    try {
        const { year } = req.query;

        if (!year || typeof year !== "string") {
            throw new ValidationError("Query parameter 'year' is required");
        }

        if (!isUUID(year)) {
            throw new ValidationError("'year' must be a valid UUID");
        }

        const rows = await getPendingFees(year);

        res.json(rows);

    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }

});


export default router;