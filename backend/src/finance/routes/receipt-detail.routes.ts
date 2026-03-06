import { Router, Request, Response } from "express";
import { getReceiptData } from "../services/report.service";
import { toErrorResponse, NotFoundError, ValidationError } from "../../shared/error";
import { isUUID } from "../../shared/validators";
import {
    getClassNameMap,
    getStudentBasicInfoMap,
} from "../../shared/identity-lookup";

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/receipts/:paymentId
// Returns a complete, printable receipt for a given payment.
//
// Receipt number format: SKA-{startYear}-{sequence padded to 6 digits}
// e.g. SKA-2025-000123
//
// Student and class names are resolved from the identity subsystem.
// ---------------------------------------------------------------------------
router.get("/:paymentId", async (req: Request, res: Response) => {
    try {
        const paymentId = String(req.params.paymentId);

        if (!isUUID(paymentId)) {
            throw new ValidationError("'paymentId' must be a valid UUID");
        }

        const data = await getReceiptData(paymentId);
        if (!data) {
            throw new NotFoundError("Payment", paymentId);
        }

        // Resolve student name and class name from identity subsystem
        const studentMap = await getStudentBasicInfoMap([data.student_id]);
        const student = studentMap.get(data.student_id);

        let className = "Unknown";
        if (data.class_id) {
            const classMap = await getClassNameMap([data.class_id]);
            className = classMap.get(data.class_id) ?? "Unknown";
        }

        // Build deterministic receipt number: SKA-{startYear}-{seq}
        // academic_year is e.g. '2025-26', extract the start year
        const startYear = data.academic_year.split("-")[0];
        const seq = String(data.receipt_seq).padStart(6, "0");
        const receiptNumber = `SKA-${startYear}-${seq}`;

        res.json({
            receiptNumber,
            paymentId: data.payment_id,
            studentId: data.student_id,
            studentName: student
                ? `${student.firstName} ${student.lastName}`
                : "Unknown",
            className,
            amount: Number(data.amount),
            mode: data.mode,
            reference: data.reference ?? undefined,
            collectedBy: data.collected_by,
            date: data.created_at instanceof Date
                ? data.created_at.toISOString()
                : String(data.created_at),
        });
    } catch (err) {
        const { status, body } = toErrorResponse(err);
        res.status(status).json(body);
    }
});

export default router;
