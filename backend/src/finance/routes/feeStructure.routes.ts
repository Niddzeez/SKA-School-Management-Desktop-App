import { Router, Request, Response } from "express";
import { feeStructureService, FeeStructure, FeeComponent } from "../services/feeStructure.service";
import { requireRole } from "../../auth/middleware/requireRole";
import { requireAuth } from "../../auth/middleware/requireAuth";

const router = Router();

// GET /api/fee-structures
router.get("/", requireAuth, async (_req: Request, res: Response): Promise<void> => {
    try {
        const structures = await feeStructureService.getAll();
        res.json(structures);
    } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Failed to fetch fee structures" });
    }
});

// POST /api/fee-structures
router.post("/", requireAuth, requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
    try {
        const { classId, academicSessionId } = req.body;
        if (!classId || !academicSessionId) {
            res.status(400).json({ error: "Missing required fields: classId, academicSessionId" });
            return;
        }

        const created = await feeStructureService.create(classId, academicSessionId);
        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Failed to create fee structure" });
    }
});

// POST /api/fee-structures/:id/components
router.post("/:id/components", requireAuth, requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { name, amount, mandatory } = req.body;
        if (!name || amount === undefined || mandatory === undefined) {
            res.status(400).json({ error: "Missing required fields: name, amount, mandatory" });
            return;
        }

        const updated = await feeStructureService.addComponent(id, name, amount, mandatory);
        res.status(201).json(updated);
    } catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : "Failed to add component" });
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
        res.status(400).json({ error: err instanceof Error ? err.message : "Failed to remove component" });
    }
});

// POST /api/fee-structures/:id/activate
router.post("/:id/activate", requireAuth, requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await feeStructureService.activate(id);
        res.json({ success: true, message: "Fee structure activated" });
    } catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : "Failed to activate fee structure" });
    }
});

export default router;
