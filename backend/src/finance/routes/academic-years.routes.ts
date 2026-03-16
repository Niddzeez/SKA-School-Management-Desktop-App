import { Router, Request, Response } from "express";
import {
    getAllSessions,
} from "../services/ledger.service";
import { mapAcademicSession } from "../mappers/academic-session.mapper";
import { toErrorResponse } from "../../shared/error";
import { requireRole } from "../../auth/middleware/requireRole";
import { ValidationError } from "../../shared/error";
import { NotFoundError } from "../../shared/error";
import { getPool } from "../../config/postgres";
import { isUUID } from "../../shared/validators";

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/academic-years
// Returns all academic sessions ordered most-recent first.
// Response shape matches frontend AcademicYearMeta.
// ---------------------------------------------------------------------------
router.get("/", async (_req: Request, res: Response) => {
    try {
        const rows = await getAllSessions();
        res.json(rows.map(mapAcademicSession));
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// ---------------------------------------------------------------------------
// POST /api/academic-years/:id/lock-promotion
// Locks the promotion for the given academic session.
// ---------------------------------------------------------------------------
router.post("/:id/lock-promotion", requireRole("ADMIN"), async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);

        if (!isUUID(id)) {
            throw new ValidationError("'id' must be a valid academic session UUID");
        }

        const pool = getPool();

        const { rowCount } = await pool.query(
            `
      UPDATE academic_sessions
      SET is_promotion_locked = TRUE
      WHERE id = $1
      `,
            [id]
        );

        if (rowCount === 0) {
            throw new NotFoundError("Academic session", id);
        }

        res.json({ success: true });
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});


/* =========================
   Pending Balance Summary
========================= */

router.get("/:id/pending-summary", async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();
        const result = await pool.query(
            `
      SELECT COUNT(*)::int AS pending_count
      FROM ledger_summary ls
      JOIN student_fee_ledgers l
        ON l.id = ls.ledger_id
      WHERE l.academic_session_id = $1
      AND (ls.base_total + ls.adjustments_total - ls.paid_total) > 0
      `,
            [id]
        );

        return res.json({
            pendingCount: result.rows[0].pending_count,
        });
    } catch (err) {
        console.error("Failed to compute pending balances:", err);
        res.status(500).json({
            message: "Failed to compute pending balances",
        });
    }
});

export default router;
