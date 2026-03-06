import { Router, Request, Response } from "express";
import { toErrorResponse, ValidationError, NotFoundError } from "../../shared/error";

// Finance services
import {
    getDashboardOverview,
    getMonthlyCollections,
    getClassWiseCollections,
    getFinanceSummary,
    getRecentPayments,
    getActiveSessionName
} from "../../finance/services/dashboard.service";

// Mapper
import {
    mapDashboardOverview,
    mapMonthlyCollection,
    mapFinanceSummary,
    ClassCollectionResponse,
    mapRecentPayment,
    RecentPaymentResponse
} from "../mappers/dashboard.mapper";

// Identity resolution
import { getClassNameMap, getStudentBasicInfoMap } from "../../shared/identity-lookup";

const router = Router();

// ===========================================================================
// GET /api/dashboard
// Provides aggregated dashboard data expected by the frontend.
// ===========================================================================
router.get(
    "/",
    async (req: Request, res: Response) => {
        try {
            let year = req.query.year as string;
            if (!year) {
                const activeSession = await getActiveSessionName();
                if (!activeSession) {
                    throw new ValidationError("No active academic session found. Please provide 'year' query parameter.");
                }
                year = activeSession;
            }

            const [overview, classCollections, recentRows] = await Promise.all([
                getDashboardOverview(year),
                getClassWiseCollections(year),
                getRecentPayments(year, 10)
            ]);

            if (!overview) {
                return res.json({
                    totalCollected: 0,
                    totalExpenses: 0,
                    netBalance: 0,
                    classSummaries: [],
                    recentPayments: []
                });
            }

            // Map class names
            const classIds = classCollections.map((r) => r.class_id);
            const classMap = await getClassNameMap(classIds);
            const classSummaries: ClassCollectionResponse[] = classCollections.map((row) => ({
                classId: row.class_id,
                className: classMap.get(row.class_id) ?? "Unknown",
                collected: parseFloat(row.collected)
            }));

            // Map student names
            const studentIds = recentRows.map((r) => r.student_id);
            const studentMap = await getStudentBasicInfoMap(studentIds);
            const recentPayments: RecentPaymentResponse[] = recentRows.map((row) => {
                const info = studentMap.get(row.student_id);
                const studentName = info ? `${info.firstName} ${info.lastName}`.trim() : "Unknown";
                return mapRecentPayment(row, studentName);
            });

            const totalCollected = parseFloat(overview.total_collected);
            const totalExpenses = parseFloat(overview.total_expenses);
            const netBalance = parseFloat(overview.net_balance);

            res.json({
                totalCollected,
                totalExpenses,
                netBalance,
                classSummaries,
                recentPayments
            });

        } catch (err) {
            const { status, body } = toErrorResponse(err);
            res.status(status).json(body);
        }
    }
);

// ===========================================================================
// GET /api/dashboard/overview?year=<academicYear>
// Provides high-level dashboard financial totals.
// ===========================================================================
router.get(
    "/overview",
    async (req: Request, res: Response) => {
        try {
            const year = req.query.year as string;
            if (!year) {
                throw new ValidationError("Query parameter 'year' is required");
            }

            const data = await getDashboardOverview(year);
            if (!data) {
                return res.json({
                    totalStudents: 0,
                    totalCollected: 0,
                    totalPending: 0,
                    totalAdjustments: 0,
                    totalExpenses: 0,
                    netBalance: 0
                });
            }

            res.json(mapDashboardOverview(data));
        } catch (err) {
            const { status, body } = toErrorResponse(err);
            res.status(status).json(body);
        }
    }
);

// ===========================================================================
// GET /api/dashboard/monthly-collections?year=<academicYear>
// Provides monthly breakdown collections.
// ===========================================================================
router.get(
    "/monthly-collections",
    async (req: Request, res: Response) => {
        try {
            const year = req.query.year as string;
            if (!year) {
                throw new ValidationError("Query parameter 'year' is required");
            }

            const data = await getMonthlyCollections(year);
            res.json(data.map(mapMonthlyCollection));
        } catch (err) {
            const { status, body } = toErrorResponse(err);
            res.status(status).json(body);
        }
    }
);

// ===========================================================================
// GET /api/dashboard/class-collections?year=<academicYear>
// Provides collections grouped by class.
// ===========================================================================
router.get(
    "/class-collections",
    async (req: Request, res: Response) => {
        try {
            const year = req.query.year as string;
            if (!year) {
                throw new ValidationError("Query parameter 'year' is required");
            }

            const data = await getClassWiseCollections(year);

            // Fetch class names from external sub-system
            const classIds = data.map((r) => r.class_id);
            const classMap = await getClassNameMap(classIds);

            const response: ClassCollectionResponse[] = data.map((row) => ({
                classId: row.class_id,
                className: classMap.get(row.class_id) ?? "Unknown",
                collected: parseFloat(row.collected)
            }));

            res.json(response);
        } catch (err) {
            const { status, body } = toErrorResponse(err);
            res.status(status).json(body);
        }
    }
);

// ===========================================================================
// GET /api/dashboard/finance-summary?year=<academicYear>
// Provides income vs expense total.
// ===========================================================================
router.get(
    "/finance-summary",
    async (req: Request, res: Response) => {
        try {
            const year = req.query.year as string;
            if (!year) {
                throw new ValidationError("Query parameter 'year' is required");
            }

            const data = await getFinanceSummary(year);
            if (!data) {
                return res.json({
                    income: 0,
                    expenses: 0,
                    balance: 0
                });
            }

            res.json(mapFinanceSummary(data));
        } catch (err) {
            const { status, body } = toErrorResponse(err);
            res.status(status).json(body);
        }
    }
);

export default router;
