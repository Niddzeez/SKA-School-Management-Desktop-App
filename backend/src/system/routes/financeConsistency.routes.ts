import { Router } from "express";
import { runFinanceConsistencyCheck } from "../services/financeConsistency.service";
import { requireAuth } from "../../auth/middleware/requireAuth";
import { requireRole } from "../../auth/middleware/requireRole";

const router = Router();

/**
 * GET /api/system/finance-consistency-check
 * 
 * Conducts a read-only audit across PostgreSQL ledger architectures, checking 
 * financial integrity mathematically.
 */
router.get(
    "/finance-consistency-check",
    requireAuth as any,
    requireRole("ADMIN") as any,
    async (req, res, next) => {
        try {
            const report = await runFinanceConsistencyCheck();
            res.json(report);
        } catch (err) {
            next(err);
        }
    }
);

export default router;
