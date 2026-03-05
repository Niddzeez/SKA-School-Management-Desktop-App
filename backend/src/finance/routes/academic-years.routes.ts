import { Router, Request, Response } from "express";
import {
    getAllSessions,
} from "../services/ledger.service";
import { mapAcademicSession } from "../mappers/academic-session.mapper";
import { toErrorResponse } from "../../shared/error";

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

export default router;
