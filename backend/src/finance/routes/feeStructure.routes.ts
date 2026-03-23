import { Router, Request, Response } from "express";
import { feeStructureService, FeeStructure, FeeComponent } from "../services/feeStructure.service";
import { requireRole } from "../../auth/middleware/requireRole";
import { requireAuth } from "../../auth/middleware/requireAuth";
import { getPool } from "../../config/postgres";
import {
    toErrorResponse,
    ValidationError,
    NotFoundError,
} from "../../shared/error";
const router = Router();

// GET /api/fee-structures
router.get("/", requireAuth, async (_req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId } = _req.query;
        const structures = await feeStructureService.getAll(typeof sessionId === "string" ? sessionId : undefined);
        res.json(structures);
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// POST /api/fee-structures
router.post("/", requireAuth, requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
    try {
        const { classId, academicSessionId } = req.body;
        if (!classId || !academicSessionId) {
            const error = new ValidationError("Missing required fields: classId, academicSessionId");
            return;
        }

        const created = await feeStructureService.create(classId, academicSessionId);
        res.status(201).json(created);
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// POST /api/fee-structures/:id/components
router.post("/:id/components", requireAuth, requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { name, amount, mandatory } = req.body;
        if (!name || amount === undefined || mandatory === undefined) {
            const error = new ValidationError("Missing required fields: name, amount, mandatory");
            return;
        }

        const updated = await feeStructureService.addComponent(id, name, amount, mandatory);
        res.status(201).json(updated);
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// DELETE /api/fee-structures/:id/components/:componentId
router.delete("/:id/components/:componentId", requireAuth, requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const componentId = req.params.componentId as string;
        const updated = await feeStructureService.removeComponent(id, componentId);
        res.json({ success: true, structure: updated });
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// POST /api/fee-structures/:id/activate
router.post("/:id/activate", requireAuth, requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await feeStructureService.activate(id);
        res.json({ success: true, message: "Fee structure activated" });
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

// DELETE /api/fee-structures/:id
router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        // Only DRAFT structures can be deleted
        const pool = getPool();
        const { rows } = await pool.query(
            `SELECT status FROM fee_structures WHERE id = $1`,
            [id]
        );

        if (rows.length === 0) {
            res.status(404).json({ error: "Fee structure not found" });
            return;
        }

        if (rows[0].status !== "DRAFT") {
            res.status(409).json({ error: "Only DRAFT fee structures can be deleted" });
            return;
        }

        await pool.query(`DELETE FROM fee_structures WHERE id = $1`, [id]);
        res.json({ success: true });
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});
export default router;
