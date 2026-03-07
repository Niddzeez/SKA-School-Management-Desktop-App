import { Router } from "express";
import { runLedgerReplay } from "../services/ledgerReplay.service";
import { requireAuth } from "../../auth/middleware/requireAuth";
import { requireRole } from "../../auth/middleware/requireRole";

const router = Router();

/**
 * GET /api/system/ledger-replay/:ledgerId
 * 
 * Replays history mathematically identifying discrepancies between offline mathematical calculations and native DB views.
 */
router.get(
    "/ledger-replay/:ledgerId",
    requireAuth,
    requireRole("ADMIN"),
    async (req, res, next) => {
        try {
            const report = await runLedgerReplay(req.params.ledgerId);
            res.json(report);
        } catch (err) {
            next(err);
        }
    }
);

export default router;
