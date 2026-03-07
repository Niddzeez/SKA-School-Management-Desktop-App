import { Router } from "express";
import { buildLedgerTimeline } from "../services/ledgerTimeline.service";
import { requireAuth } from "../../auth/middleware/requireAuth";
import { requireRole } from "../../auth/middleware/requireRole";

const router = Router();

/**
 * GET /api/system/ledger-timeline/:ledgerId
 * 
 * Fetches the sequential timeline of ledger mutations aggregating SQL temporal event logs.
 */
router.get(
    "/ledger-timeline/:ledgerId",
    requireAuth as any,
    requireRole("ADMIN") as any,
    async (req, res, next) => {
        try {
            const report = await buildLedgerTimeline(req.params.ledgerId);
            res.json(report);
        } catch (err) {
            next(err);
        }
    }
);

export default router;
