import { Router } from "express";
import { runReconciliation } from "../services/reconciliation.service";
import { requireAuth } from "../../auth/middleware/requireAuth";
import { requireRole } from "../../auth/middleware/requireRole";

const router = Router();

router.get(
    "/reconciliation",
    requireAuth,
    requireRole("ADMIN"),
    async (req, res) => {
        try {
            const report = await runReconciliation();
            res.json(report);
        } catch (err) {
            console.error("Reconciliation failed:", err);
            res.status(500).json({
                message: "Failed to run reconciliation"
            });
        }
    }
);

export default router;