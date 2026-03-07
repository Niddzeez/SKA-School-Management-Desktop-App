import { Router, Request, Response } from "express";
import { feeStructureService, FeeStructure, FeeComponent } from "../services/feeStructure.service";
import { requireRole } from "../../auth/middleware/requireRole";

const router = Router();

// GET /api/fee-structures
router.get("/", async (_req: Request, res: Response): Promise<void> => {
    try {
        const structures = await feeStructureService.getAll();
        res.json(structures);
    } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Failed to fetch fee structures" });
    }
});

// POST /api/fee-structures
router.post("/", requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
    try {
        const { classId, academicYear } = req.body;
        if (!classId || !academicYear) {
            res.status(400).json({ error: "Missing required fields: classId, academicYear" });
            return;
        }

        const created = await feeStructureService.create(classId, academicYear);
        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Failed to create fee structure" });
    }
});

// POST /api/fee-structures/:id/components
router.post("/:id/components", requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, amount } = req.body;
        if (!name || amount === undefined) {
            res.status(400).json({ error: "Missing required fields: name, amount" });
            return;
        }

        const updated = await feeStructureService.addComponent(id, name, amount);
        res.status(201).json(updated);
    } catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : "Failed to add component" });
    }
});

// DELETE /api/fee-structures/:id/components/:componentId
router.delete("/:id/components/:componentId", requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, componentId } = req.params;
        const updated = await feeStructureService.removeComponent(id, componentId);
        res.json({ success: true, structure: updated });
    } catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : "Failed to remove component" });
    }
});

// POST /api/fee-structures/:id/activate
router.post("/:id/activate", requireRole("ADMIN"), async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await feeStructureService.activate(id);
        res.json({ success: true, message: "Fee structure activated" });
    } catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : "Failed to activate fee structure" });
    }
});

export default router;
