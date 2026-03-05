import { Router, Request, Response } from "express";
import { getReceiptsByStudent } from "../services/ledger.service";
import { mapPayment } from "../mappers/ledger.mapper";
import { toErrorResponse, ValidationError } from "../../shared/error";
import { isMongoId } from "../../shared/validators";

const router = Router({ mergeParams: true });

// ---------------------------------------------------------------------------
// GET /api/students/:studentId/receipts
// Returns all payments for a student ordered by created_at descending.
// studentId is an opaque MongoDB ObjectId string.
// ---------------------------------------------------------------------------
router.get("/", async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;

        if (!studentId || typeof studentId !== "string" || !isMongoId(studentId)) {
            throw new ValidationError("'studentId' must be a valid MongoDB ObjectId");
        }

        const rows = await getReceiptsByStudent(studentId);
        res.json(rows.map(mapPayment));
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

export default router;
